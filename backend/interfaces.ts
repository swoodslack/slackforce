export interface Filter {
  field: string;
  comparison: string;
  value: string;
}

export interface LayoutBlock {
  label: string;
  value: string;
  name: string;
  order: number;
}

export interface ObjectDescribeFieldOption {
  value: string;
}

export interface ObjectDescribeField {
  name: string;
  label: string;
  type: string;
  options?: ObjectDescribeFieldOption[];
}

export interface ObjectDescribe {
  name: string;
  label: string;
  fields: ObjectDescribeField[];
  layout?: string;
}

export interface SObject {
  label: string;
  name: string;
}

export interface Settings {
  channel_id: string;
  subdomain: string;
  session_id: string;
  last_polled: number;
  trigger_id?: string;
}

export interface Subscription {
  id?: string;
  channel_id: string;
  sobject: string;
  filters: Filter[];
}
