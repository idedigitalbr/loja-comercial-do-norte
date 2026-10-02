import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CouponDiscountType, CouponStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export type CreateCouponInput = {
  code: string;
  status?: CouponStatus;
  description?: string | null;
  discountType?: CouponDiscountType;
  discountValue?: number;
  allowFreeShipping?: boolean;
  individualUse?: boolean;
  excludeSaleItems?: boolean;
  startsAt?: Date;
  endsAt?: Date | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  minimumSubtotalCents?: number | null;
  maximumSubtotalCents?: number | null;
  maxEligibleItems?: number | null;
  productIds?: string[];
  excludedProductIds?: string[];
  brandIds?: string[];
  excludedBrandIds?: string[];
  categoryIds?: string[];
  excludedCategoryIds?: string[];
  emailPatterns?: string[];
};

type CouponRuleCollections = Pick<CreateCouponInput, 'productIds' | 'excludedProductIds' | 'brandIds' | 'excludedBrandIds' | 'categoryIds' | 'excludedCategoryIds' | 'emailPatterns'>;

function uniqueTrimmed(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

function validateCouponInput(input: Partial<CreateCouponInput>) {
  if (input.code !== undefined && !input.code.trim()) throw new BadRequestException('O código do cupom é obrigatório.');
  if (input.discountValue !== undefined && (!Number.isInteger(input.discountValue) || input.discountValue < 0)) {
    throw new BadRequestException('O valor do desconto deve ser um número inteiro maior ou igual a zero.');
  }
  if (input.discountType === CouponDiscountType.PERCENTAGE && input.discountValue !== undefined && input.discountValue > 100) {
    throw new BadRequestException('O percentual do desconto deve estar entre 0 e 100.');
  }
  for (const value of [input.minimumSubtotalCents, input.maximumSubtotalCents, input.maxEligibleItems, input.usageLimit, input.perCustomerLimit]) {
    if (value !== undefined && value !== null && (!Number.isInteger(value) || value < 0)) {
      throw new BadRequestException('Os limites do cupom devem ser números inteiros positivos.');
    }
  }
  if (input.usageLimit !== undefined && input.usageLimit !== null && input.usageLimit < 1) throw new BadRequestException('O limite de uso por cupom deve ser maior que zero.');
  if (input.perCustomerLimit !== undefined && input.perCustomerLimit !== null && input.perCustomerLimit < 1) throw new BadRequestException('O limite por cliente deve ser maior que zero.');
  if (input.maxEligibleItems !== undefined && input.maxEligibleItems !== null && input.maxEligibleItems < 1) throw new BadRequestException('O limite de itens elegíveis deve ser maior que zero.');
  if (input.minimumSubtotalCents !== undefined && input.minimumSubtotalCents !== null && input.maximumSubtotalCents !== undefined && input.maximumSubtotalCents !== null && input.maximumSubtotalCents < input.minimumSubtotalCents) {
    throw new BadRequestException('O gasto máximo não pode ser menor que o gasto mínimo.');
  }
  if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) throw new BadRequestException('A data de expiração deve ser posterior ao início.');

  const collectionFields: Array<keyof CouponRuleCollections> = ['productIds', 'excludedProductIds', 'brandIds', 'excludedBrandIds', 'categoryIds', 'excludedCategoryIds', 'emailPatterns'];
  for (const field of collectionFields) {
    if (input[field]?.some((value) => !value.trim())) throw new BadRequestException('As regras do cupom não podem conter itens vazios.');
  }
  const conflictingRules = [
    ['productIds', 'excludedProductIds'],
    ['brandIds', 'excludedBrandIds'],
    ['categoryIds', 'excludedCategoryIds'],
  ] as const;
  for (const [includedField, excludedField] of conflictingRules) {
    const excluded = new Set(uniqueTrimmed(input[excludedField]));
    if (uniqueTrimmed(input[includedField]).some((value) => excluded.has(value))) {
      throw new BadRequestException('O mesmo item não pode estar incluído e excluído na mesma regra.');
    }
  }
}

function ruleCreates(input: CouponRuleCollections) {
  const productIds = uniqueTrimmed(input.productIds);
  const excludedProductIds = uniqueTrimmed(input.excludedProductIds);
  const brandIds = uniqueTrimmed(input.brandIds);
  const excludedBrandIds = uniqueTrimmed(input.excludedBrandIds);
  const categoryIds = uniqueTrimmed(input.categoryIds);
  const excludedCategoryIds = uniqueTrimmed(input.excludedCategoryIds);
  const emailPatterns = uniqueTrimmed(input.emailPatterns).map((pattern) => pattern.toLowerCase());

  const productRules = [...productIds.map((productId) => ({ productId, excluded: false })), ...excludedProductIds.map((productId) => ({ productId, excluded: true }))];
  const brandRules = [...brandIds.map((brandId) => ({ brandId, excluded: false })), ...excludedBrandIds.map((brandId) => ({ brandId, excluded: true }))];
  const categoryRules = [...categoryIds.map((categoryId) => ({ categoryId, excluded: false })), ...excludedCategoryIds.map((categoryId) => ({ categoryId, excluded: true }))];
  return {
    productRules: { deleteMany: {}, ...(productRules.length ? { create: productRules } : {}) },
    brandRules: { deleteMany: {}, ...(brandRules.length ? { create: brandRules } : {}) },
    categoryRules: { deleteMany: {}, ...(categoryRules.length ? { create: categoryRules } : {}) },
    emailRestrictions: { deleteMany: {}, ...(emailPatterns.length ? { create: emailPatterns.map((pattern) => ({ pattern })) } : {}) },
  };
}

function createRuleData(input: CouponRuleCollections) {
  const rules = ruleCreates(input);
  return {
    ...(rules.productRules.create ? { productRules: { create: rules.productRules.create } } : {}),
    ...(rules.brandRules.create ? { brandRules: { create: rules.brandRules.create } } : {}),
    ...(rules.categoryRules.create ? { categoryRules: { create: rules.categoryRules.create } } : {}),
    ...(rules.emailRestrictions.create ? { emailRestrictions: { create: rules.emailRestrictions.create } } : {}),
  };
}

function updateRuleData(input: CouponRuleCollections) {
  const rules = ruleCreates(input);
  return rules;
}

@Injectable()
export class PromotionsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listCoupons() {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { startsAt: 'desc' },
      include: {
        promotion: true,
        productRules: { include: { product: { select: { id: true, name: true } } } },
        brandRules: { include: { brand: { select: { id: true, name: true } } } },
        categoryRules: { include: { category: { select: { id: true, name: true } } } },
        emailRestrictions: true,
      },
      take: 100,
    });
    const now = new Date();
    return coupons.map((coupon) => coupon.status === CouponStatus.ACTIVE && coupon.endsAt !== null && coupon.endsAt <= now
      ? { ...coupon, status: CouponStatus.EXPIRED }
      : coupon);
  }

  createCoupon(input: CreateCouponInput) {
    validateCouponInput(input);
    return this.prisma.coupon.create({
      data: {
        code: input.code.trim().toUpperCase(),
        description: input.description?.trim() || null,
        status: input.status ?? CouponStatus.ACTIVE,
        discountType: input.discountType ?? CouponDiscountType.FIXED_CART,
        discountValue: input.discountValue ?? 0,
        allowFreeShipping: input.allowFreeShipping ?? false,
        individualUse: input.individualUse ?? false,
        excludeSaleItems: input.excludeSaleItems ?? false,
        startsAt: input.startsAt ?? new Date(),
        endsAt: input.endsAt,
        usageLimit: input.usageLimit,
        perCustomerLimit: input.perCustomerLimit,
        minimumSubtotalCents: input.minimumSubtotalCents,
        maximumSubtotalCents: input.maximumSubtotalCents,
        maxEligibleItems: input.maxEligibleItems,
        ...createRuleData(input),
      },
    });
  }

  async updateCoupon(id: string, input: Partial<CreateCouponInput> & { status?: CouponStatus }) {
    const hasOwn = (key: keyof CreateCouponInput) => Object.prototype.hasOwnProperty.call(input, key);
    const hasProducts = input.productIds !== undefined || input.excludedProductIds !== undefined;
    const hasBrands = input.brandIds !== undefined || input.excludedBrandIds !== undefined;
    const hasCategories = input.categoryIds !== undefined || input.excludedCategoryIds !== undefined;
    const hasEmails = input.emailPatterns !== undefined;
    const current = await this.prisma.coupon.findUnique({
      where: { id },
      include: { productRules: true, brandRules: true, categoryRules: true, emailRestrictions: true },
    });
    if (!current) throw new NotFoundException('CUPOM_NOT_FOUND');

    const effective: CreateCouponInput = {
      code: input.code ?? current.code,
      status: input.status ?? current.status,
      description: input.description ?? current.description,
      discountType: input.discountType ?? current.discountType,
      discountValue: input.discountValue ?? current.discountValue,
      allowFreeShipping: input.allowFreeShipping ?? current.allowFreeShipping,
      individualUse: input.individualUse ?? current.individualUse,
      excludeSaleItems: input.excludeSaleItems ?? current.excludeSaleItems,
      startsAt: input.startsAt ?? current.startsAt,
      endsAt: hasOwn('endsAt') ? input.endsAt : current.endsAt,
      usageLimit: hasOwn('usageLimit') ? input.usageLimit : current.usageLimit,
      perCustomerLimit: hasOwn('perCustomerLimit') ? input.perCustomerLimit : current.perCustomerLimit,
      minimumSubtotalCents: hasOwn('minimumSubtotalCents') ? input.minimumSubtotalCents : current.minimumSubtotalCents,
      maximumSubtotalCents: hasOwn('maximumSubtotalCents') ? input.maximumSubtotalCents : current.maximumSubtotalCents,
      maxEligibleItems: hasOwn('maxEligibleItems') ? input.maxEligibleItems : current.maxEligibleItems,
      productIds: input.productIds ?? current.productRules.filter((rule) => !rule.excluded).map((rule) => rule.productId),
      excludedProductIds: input.excludedProductIds ?? current.productRules.filter((rule) => rule.excluded).map((rule) => rule.productId),
      brandIds: input.brandIds ?? current.brandRules.filter((rule) => !rule.excluded).map((rule) => rule.brandId),
      excludedBrandIds: input.excludedBrandIds ?? current.brandRules.filter((rule) => rule.excluded).map((rule) => rule.brandId),
      categoryIds: input.categoryIds ?? current.categoryRules.filter((rule) => !rule.excluded).map((rule) => rule.categoryId),
      excludedCategoryIds: input.excludedCategoryIds ?? current.categoryRules.filter((rule) => rule.excluded).map((rule) => rule.categoryId),
      emailPatterns: input.emailPatterns ?? current.emailRestrictions.map((rule) => rule.pattern),
    };
    validateCouponInput(effective);

    const reactivatedStatus = effective.status === CouponStatus.EXPIRED
      && current.status === CouponStatus.ACTIVE
      && effective.endsAt !== null
      && effective.endsAt !== undefined
      && effective.endsAt > new Date()
      ? CouponStatus.ACTIVE
      : input.status;
    const data: Record<string, unknown> = {
      ...(input.code !== undefined ? { code: input.code.trim().toUpperCase() } : {}),
      ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
      ...(input.discountType !== undefined ? { discountType: input.discountType } : {}),
      ...(input.discountValue !== undefined ? { discountValue: input.discountValue } : {}),
      ...(input.allowFreeShipping !== undefined ? { allowFreeShipping: input.allowFreeShipping } : {}),
      ...(input.individualUse !== undefined ? { individualUse: input.individualUse } : {}),
      ...(input.excludeSaleItems !== undefined ? { excludeSaleItems: input.excludeSaleItems } : {}),
      ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
      ...(input.usageLimit !== undefined ? { usageLimit: input.usageLimit } : {}),
      ...(input.perCustomerLimit !== undefined ? { perCustomerLimit: input.perCustomerLimit } : {}),
      ...(input.minimumSubtotalCents !== undefined ? { minimumSubtotalCents: input.minimumSubtotalCents } : {}),
      ...(input.maximumSubtotalCents !== undefined ? { maximumSubtotalCents: input.maximumSubtotalCents } : {}),
      ...(input.maxEligibleItems !== undefined ? { maxEligibleItems: input.maxEligibleItems } : {}),
      ...(reactivatedStatus !== undefined ? { status: reactivatedStatus } : {}),
    };

    if (hasProducts) Object.assign(data, { productRules: updateRuleData({ productIds: effective.productIds ?? [], excludedProductIds: effective.excludedProductIds ?? [] }).productRules });
    if (hasBrands) Object.assign(data, { brandRules: updateRuleData({ brandIds: effective.brandIds ?? [], excludedBrandIds: effective.excludedBrandIds ?? [] }).brandRules });
    if (hasCategories) Object.assign(data, { categoryRules: updateRuleData({ categoryIds: effective.categoryIds ?? [], excludedCategoryIds: effective.excludedCategoryIds ?? [] }).categoryRules });
    if (hasEmails) Object.assign(data, { emailRestrictions: updateRuleData({ emailPatterns: effective.emailPatterns ?? [] }).emailRestrictions });

    return this.prisma.coupon.update({ where: { id }, data: data as never });
  }
}
