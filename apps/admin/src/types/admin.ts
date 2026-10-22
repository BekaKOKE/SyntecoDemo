/** TypeScript interfaces matching the admin-data.js mock structures */

export interface Stat {
  id: string;
  label: string;
  value: string;
  delta: string;
  up: boolean;
  sparkline: number[];
  tone: 'red' | 'ink' | 'info' | 'ok';
}

export interface RevenuePoint {
  w: string;   // week label e.g. "W36"
  v: number;   // value in millions
}

export interface CategoryShare {
  name: string;
  share: number;
  sum: string;
  delta: string;
}

export interface ActivityItem {
  t: string;      // timestamp
  user: string;   // full name
  text: string;   // action description
  ref: string;    // reference code
  tag: string;    // category tag
  tone: 'ok' | 'info' | 'red' | 'ink' | 'warn';
}

export interface AdminProduct {
  id: string;
  sku: string;
  brand: string;
  name: string;
  cat: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  tone: 'red' | 'teal' | 'blue' | 'graphite' | 'amber';
}

export interface Inquiry {
  id: string;
  company: string;
  name: string;
  phone: string;
  items: number;
  sum: number;
  status: 'new' | 'in_progress' | 'quoted' | 'closed' | 'cancelled';
  priority: 'high' | 'normal' | 'low';
  ts: string;     // human-readable timestamp
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;    // e.g. "3.6M"
  owner: string;    // initials e.g. "АК"
  days: number;
  hot?: boolean;
}

export interface DealColumn {
  id: string;       // stage name
  wip: number;      // work-in-progress count
  sum: string;      // total value e.g. "8.4M"
  deals: Deal[];
}

export interface Customer {
  id: string;
  company: string;
  bin: string;
  manager: string;
  segment: 'Стратегический' | 'Корпоративный' | 'Малый бизнес';
  deals: number;
  sum: string;
  since: string;
  tone: 'red' | 'ink' | 'blue' | 'graphite' | 'amber' | 'teal';
}

/** Mock data container — matches window.ADMIN_DATA structure */
export interface AdminData {
  stats: Stat[];
  revenueByWeek: RevenuePoint[];
  topCategories: CategoryShare[];
  activity: ActivityItem[];
  products: AdminProduct[];
  inquiries: Inquiry[];
  pipeline: DealColumn[];
  customers: Customer[];
}
