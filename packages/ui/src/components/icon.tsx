import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bold,
  Calendar,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CirclePlus,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Edit3,
  Ellipsis,
  Eye,
  FileText,
  Globe2,
  Heart,
  HeartHandshake,
  Image,
  Instagram,
  Italic,
  Languages,
  Link2,
  List,
  ListOrdered,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Microscope,
  Minus,
  Package,
  Pause,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  TicketPercent,
  Trash2,
  TrendingUp,
  User,
  Underline,
  Upload,
  Users,
  Warehouse,
  X,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

export type IconName =
  | 'align-center'
  | 'align-justify'
  | 'align-left'
  | 'align-right'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-up-right'
  | 'badge-check'
  | 'bar-chart-3'
  | 'bold'
  | 'calendar'
  | 'calendar-plus'
  | 'check'
  | 'check-circle-2'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'circle'
  | 'circle-alert'
  | 'circle-check'
  | 'circle-dot'
  | 'circle-plus'
  | 'clipboard-check'
  | 'clipboard-list'
  | 'credit-card'
  | 'edit-3'
  | 'ellipsis'
  | 'eye'
  | 'file-text'
  | 'globe-2'
  | 'heart'
  | 'heart-handshake'
  | 'image'
  | 'instagram'
  | 'italic'
  | 'languages'
  | 'link-2'
  | 'list'
  | 'list-ordered'
  | 'layout-dashboard'
  | 'log-out'
  | 'map-pin'
  | 'menu'
  | 'message-circle'
  | 'microscope'
  | 'minus'
  | 'package'
  | 'pause'
  | 'phone'
  | 'play'
  | 'plus'
  | 'refresh-cw'
  | 'save'
  | 'search'
  | 'shield'
  | 'shield-check'
  | 'shopping-bag'
  | 'shopping-cart'
  | 'sliders-horizontal'
  | 'sparkles'
  | 'star'
  | 'tag'
  | 'ticket-percent'
  | 'trash-2'
  | 'trending-up'
  | 'user'
  | 'underline'
  | 'upload'
  | 'users'
  | 'warehouse'
  | 'x';

const iconMap: Record<IconName, LucideIcon> = {
  'align-center': AlignCenter,
  'align-justify': AlignJustify,
  'align-left': AlignLeft,
  'align-right': AlignRight,
  'arrow-down': ArrowDown,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-up-right': ArrowUpRight,
  'badge-check': BadgeCheck,
  'bar-chart-3': BarChart3,
  bold: Bold,
  calendar: Calendar,
  'calendar-plus': CalendarPlus,
  check: Check,
  'check-circle-2': CheckCircle2,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  circle: Circle,
  'circle-alert': CircleAlert,
  'circle-check': CircleCheck,
  'circle-dot': CircleDot,
  'circle-plus': CirclePlus,
  'clipboard-check': ClipboardCheck,
  'clipboard-list': ClipboardList,
  'credit-card': CreditCard,
  'edit-3': Edit3,
  ellipsis: Ellipsis,
  eye: Eye,
  'file-text': FileText,
  'globe-2': Globe2,
  heart: Heart,
  'heart-handshake': HeartHandshake,
  image: Image,
  instagram: Instagram,
  italic: Italic,
  languages: Languages,
  'link-2': Link2,
  list: List,
  'list-ordered': ListOrdered,
  'layout-dashboard': LayoutDashboard,
  'log-out': LogOut,
  'map-pin': MapPin,
  menu: Menu,
  'message-circle': MessageCircle,
  microscope: Microscope,
  minus: Minus,
  package: Package,
  pause: Pause,
  phone: Phone,
  play: Play,
  plus: Plus,
  'refresh-cw': RefreshCw,
  save: Save,
  search: Search,
  shield: Shield,
  'shield-check': ShieldCheck,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  'sliders-horizontal': SlidersHorizontal,
  sparkles: Sparkles,
  star: Star,
  tag: Tag,
  'ticket-percent': TicketPercent,
  'trash-2': Trash2,
  'trending-up': TrendingUp,
  user: User,
  underline: Underline,
  upload: Upload,
  users: Users,
  warehouse: Warehouse,
  x: X,
};

export type IconProps = Omit<LucideProps, 'ref'> & {
  name: IconName;
};

export function Icon({ name, className, size = 18, strokeWidth = 1.8, 'aria-hidden': ariaHidden = true, ...props }: IconProps): React.JSX.Element {
  const IconComponent = iconMap[name];
  return (
    <IconComponent
      {...props}
      className={['icon', className].filter(Boolean).join(' ')}
      data-icon={name}
      aria-hidden={ariaHidden}
      focusable="false"
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}
