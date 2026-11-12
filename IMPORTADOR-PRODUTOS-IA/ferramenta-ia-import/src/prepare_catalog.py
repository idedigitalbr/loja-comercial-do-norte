"""
Preparador local de catálogos brutos (Excel / CSV / JSON + pasta imagens/)
para o contrato canônico consumido por `import-catalog.ts`.

Uso:
  python prepare_catalog.py --input "D:\\caminho\\pasta-bruta" --output "D:\\caminho\\saida-pronta"
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
import unicodedata
from pathlib import Path
from typing import Any

try:
    from PIL import Image
except ImportError:
    Image = None

try:
    import openpyxl
except ImportError:
    openpyxl = None


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = text.encode("ascii", "ignore").decode("ascii").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return re.sub(r"-{2,}", "-", text)


def validate_gtin(code: str) -> str:
    digits = re.sub(r"\D+", "", code or "")
    if not digits:
        return "SEM_CODIGO"
    if len(digits) not in (8, 12, 13, 14):
        return "FORMATO_NAO_GTIN"
    check = int(digits[-1])
    body = digits[:-1]
    total = 0
    for idx, ch in enumerate(reversed(body)):
        total += int(ch) * (3 if idx % 2 == 0 else 1)
    expected = (10 - (total % 10)) % 10
    return "GTIN_DIGITO_VALIDO" if check == expected else "GTIN_DIGITO_INVALIDO"


def load_tabular_rows(input_dir: Path) -> list[dict[str, Any]]:
    json_candidates = [
        input_dir / "catalogo_final.json",
        input_dir / "variacoes.json",
        input_dir / "produtos_todos_campos.json",
        input_dir / "produtos.json",
    ]
    for cand in json_candidates:
        if cand.exists():
            data = json.loads(cand.read_text(encoding="utf-8"))
            if isinstance(data, dict) and isinstance(data.get("variacoes"), list):
                return data["variacoes"]
            if isinstance(data, list):
                return data

    csv_candidates = list(input_dir.glob("*.csv"))
    if csv_candidates:
        with csv_candidates[0].open("r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f, delimiter=";")
            rows = list(reader)
            if len(rows) > 0 and len(rows[0]) > 1:
                return rows
            f.seek(0)
            return list(csv.DictReader(f, delimiter=","))

    xlsx_candidates = list(input_dir.glob("*.xlsx"))
    if xlsx_candidates and openpyxl is not None:
        wb = openpyxl.load_workbook(xlsx_candidates[0], read_only=True, data_only=True)
        ws = wb.active
        iter_rows = ws.iter_rows(values_only=True)
        headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(next(iter_rows))]
        out: list[dict[str, Any]] = []
        for row in iter_rows:
            if not any(row):
                continue
            out.append({headers[i]: row[i] for i in range(min(len(headers), len(row)))})
        return out

    raise FileNotFoundError(f"Nenhum JSON, CSV ou XLSX encontrado em: {input_dir}")


def pick(row: dict[str, Any], *keys: str) -> str:
    lower_map = {str(k).strip().lower(): v for k, v in row.items()}
    for k in keys:
        val = row.get(k)
        if val is None:
            val = lower_map.get(k.lower())
        if val is not None and str(val).strip() != "":
            return str(val).strip()
    return ""


def main() -> None:
    parser = argparse.ArgumentParser(description="Normaliza catálogo bruto para o importador da loja.")
    parser.add_argument("--input", required=True, help="Pasta com arquivos brutos e subpasta imagens/")
    parser.add_argument("--output", required=True, help="Pasta de destino normalizada")
    parser.add_argument("--legacy-source", default="catalogo-norte-import", help="Identificador do lote de importação")
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    out_images = output_dir / "imagens"
    out_images.mkdir(parents=True, exist_ok=True)

    rows = load_tabular_rows(input_dir)
    brands_map: dict[str, dict[str, Any]] = {}
    categories_map: dict[str, dict[str, Any]] = {}
    parents_map: dict[str, dict[str, Any]] = {}
    variations: list[dict[str, Any]] = []

    for idx, row in enumerate(rows, start=1):
        raw_name = pick(row, "nome_original", "nome_padronizado", "nome", "name", "produto", "titulo")
        std_name = pick(row, "nome_padronizado", "nome", "name", "produto", "titulo") or raw_name
        sku = pick(row, "sku", "codigo_sku") or f"CN-AUTO-{idx:04d}"
        parent_id = pick(row, "produto_pai_id", "legacy_id_produto") or f"CN-P{idx:04d}"
        brand = pick(row, "marca_padronizada", "marca", "brand")
        brand_slug = slugify(brand) if brand else ""
        category = pick(row, "categoria_padronizada", "categoria", "category") or "Outros Produtos"
        category_slug = slugify(category)
        subcat = pick(row, "subcategoria_padronizada", "subcategoria", "subcategory")
        subcat_slug = slugify(subcat) if subcat else ""

        gtin = pick(row, "codigo_original_catalogo", "gtin", "ean", "codigo_barras")
        gtin_status = validate_gtin(gtin)

        img_rel = pick(row, "imagem_principal", "imagem", "image", "foto")
        width = height = None
        sha256 = None
        final_img_rel = ""
        if img_rel:
            cand_paths = [input_dir / img_rel, input_dir / "imagens" / Path(img_rel).name]
            src_img = next((p for p in cand_paths if p.exists() and p.is_file()), None)
            if src_img is not None:
                dest_img = out_images / src_img.name
                if src_img.resolve() != dest_img.resolve():
                    shutil.copy2(src_img, dest_img)
                final_img_rel = f"imagens/{dest_img.name}"
                sha256 = hashlib.sha256(dest_img.read_bytes()).hexdigest()
                if Image is not None:
                    try:
                        with Image.open(dest_img) as im:
                            width, height = im.size
                    except Exception:
                        pass

        pendencias: list[str] = []
        if gtin_status == "GTIN_DIGITO_INVALIDO":
            pendencias.append("gtin_digito_verificador_invalido")
        elif gtin_status == "SEM_CODIGO":
            pendencias.append("codigo_nao_informado_no_catalogo")
        elif gtin_status == "FORMATO_NAO_GTIN":
            pendencias.append("codigo_formato_nao_gtin_padrao")
        if width and height and (width < 250 or height < 250):
            pendencias.append("foto_nativa_baixa_resolucao")

        classificacao = "BLOQUEADO" if "gtin_digito_verificador_invalido" in pendencias else (
            "RASCUNHO_COM_RESSALVAS" if pendencias else "LIBERADO"
        )

        if brand and brand_slug not in brands_map:
            brands_map[brand_slug] = {"nome": brand, "slug": brand_slug, "legacy_id": f"CN-BRAND-{brand_slug.upper()}"}
        if category_slug not in categories_map:
            categories_map[category_slug] = {
                "nome": category,
                "slug": category_slug,
                "legacy_id": f"CN-CAT-{category_slug.upper()}",
                "parent_slug": None,
                "nivel": 1,
                "sort_order": 50,
            }
        if subcat_slug and subcat_slug not in categories_map:
            categories_map[subcat_slug] = {
                "nome": subcat,
                "slug": subcat_slug,
                "legacy_id": f"CN-CAT-{subcat_slug.upper()}",
                "parent_slug": category_slug,
                "nivel": 2,
                "sort_order": 150,
            }

        slug_prod = pick(row, "slug_produto", "slug") or slugify(std_name) or f"produto-{idx}"
        variation_obj = {
            "produto_pai_id": parent_id,
            "sku": sku,
            "legacy_source": args.legacy_source,
            "legacy_id_produto": parent_id,
            "legacy_id_variante": sku,
            "nome_original": raw_name,
            "nome_padronizado": std_name,
            "slug_produto": slug_prod,
            "descricao_original": pick(row, "descricao_original", "descricao", "description"),
            "descricao_ecommerce": pick(row, "descricao_ecommerce", "descricao", "description"),
            "marca_padronizada": brand,
            "marca_slug": brand_slug,
            "categoria_padronizada": category,
            "categoria_slug": category_slug,
            "subcategoria_padronizada": subcat,
            "subcategoria_slug": subcat_slug,
            "codigo_original_catalogo": gtin,
            "validacao_digito_gtin": gtin_status,
            "codigo_referencia_fabricante": pick(row, "codigo_referencia_fabricante", "referencia", "ref"),
            "cor_variacao": pick(row, "cor_variacao", "cor", "color"),
            "tamanho_ou_modelo": pick(row, "tamanho_ou_modelo", "tamanho", "size"),
            "capacidade_volume": pick(row, "capacidade_volume", "capacidade", "volume"),
            "peso_informado": pick(row, "peso_informado", "peso"),
            "material": pick(row, "material"),
            "embalagem_original": pick(row, "embalagem_original", "embalagem"),
            "embalagem_tipo": pick(row, "embalagem_tipo"),
            "imagem_principal": final_img_rel,
            "imagem_largura": width,
            "imagem_altura": height,
            "imagem_sha256": sha256,
            "preco_cents": None,
            "classificacao_auditoria": classificacao,
            "pendencias": pendencias,
        }
        variations.append(variation_obj)

        if parent_id not in parents_map:
            parents_map[parent_id] = {
                "produto_pai_id": parent_id,
                "legacy_source": args.legacy_source,
                "legacy_id": parent_id,
                "slug": slug_prod,
                "nome_original": raw_name,
                "nome_padronizado": std_name,
                "descricao_ecommerce": variation_obj["descricao_ecommerce"],
                "marca": brand,
                "marca_slug": brand_slug,
                "categoria": category,
                "categoria_slug": category_slug,
                "subcategoria": subcat,
                "subcategoria_slug": subcat_slug,
                "imagem_principal": final_img_rel,
                "classificacao_auditoria": classificacao,
            }

    bundle = {
        "meta": {"legacy_source": args.legacy_source, "total_pais": len(parents_map), "total_variacoes": len(variations)},
        "marcas": list(brands_map.values()),
        "categorias": list(categories_map.values()),
        "produtos_pais": list(parents_map.values()),
        "variacoes": variations,
    }
    (output_dir / "catalogo_final.json").write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[prepare_catalog] Normalizado com sucesso: {len(parents_map)} pais, {len(variations)} variacoes em {output_dir}")


if __name__ == "__main__":
    main()
