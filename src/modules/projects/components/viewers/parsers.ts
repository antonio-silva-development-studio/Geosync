import * as yaml from 'js-yaml';

export interface CollectionItem {
  id: string;
  type: 'group' | 'request';
  name: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  children?: CollectionItem[];
}

// biome-ignore lint/suspicious/noExplicitAny: parsing external data
export const parseCollection = (content: string): CollectionItem[] => {
  try {
    // Try parsing as JSON first (Postman or Insomnia JSON)
    const data = JSON.parse(content);

    if (data.info && data.item) {
      return parsePostman(data);
    }

    if (data.__export_format && data.resources) {
      return parseInsomnia(data);
    }
  } catch (_e) {
    // If JSON fails, try YAML (Insomnia YAML)
    try {
      // biome-ignore lint/suspicious/noExplicitAny: parsing external data
      const data = yaml.load(content) as any;
      if (data?.__export_format && data.resources) {
        return parseInsomnia(data);
      }
    } catch (yamlError) {
      console.error('Failed to parse as YAML', yamlError);
    }
  }

  return [];
};

// biome-ignore lint/suspicious/noExplicitAny: parsing external data
const parsePostman = (data: any): CollectionItem[] => {
  // biome-ignore lint/suspicious/noExplicitAny: parsing external data
  const mapItem = (item: any): CollectionItem => {
    const isGroup = !!item.item;

    return {
      id: item.id || crypto.randomUUID(),
      type: isGroup ? 'group' : 'request',
      name: item.name,
      method: item.request?.method,
      url: item.request?.url?.raw || item.request?.url,
      headers: item.request?.header?.reduce((acc: Record<string, string>, h: any) => {
        acc[h.key] = h.value;
        return acc;
      }, {}),
      body: item.request?.body?.raw,
      children: item.item?.map(mapItem),
    };
  };

  return data.item.map(mapItem);
};

// biome-ignore lint/suspicious/noExplicitAny: parsing external data
const parseInsomnia = (data: any): CollectionItem[] => {
  const resources = data.resources || [];

  // Map to store all items by ID
  const itemMap = new Map<string, CollectionItem>();
  // Map to store children for each parent ID

  // First pass: Create CollectionItems for all requests and groups
  for (const r of resources) {
    // Insomnia export format usually has _type property
    if (r._type === 'request_group' || r._type === 'request') {
      const item: CollectionItem = {
        id: r._id,
        type: r._type === 'request_group' ? 'group' : 'request',
        name: r.name || 'Untitled',
        method: r.method,
        url: r.url,
        headers: r.headers?.reduce((acc: Record<string, string>, h: any) => {
          if (h.name) acc[h.name] = h.value || '';
          return acc;
        }, {}),
        body: r.body?.text,
        children: [],
      };
      itemMap.set(r._id, item);
    }
  }

  console.log('Parsed items count:', itemMap.size);

  // Second pass: Organize into tree
  const rootItems: CollectionItem[] = [];

  // If no items found, maybe the structure is different?
  if (itemMap.size === 0) {
    console.warn('No items found in Insomnia export resources');
    return [];
  }

  for (const r of resources) {
    if (r._type === 'request_group' || r._type === 'request') {
      const item = itemMap.get(r._id);
      if (!item) continue;

      const parentId = r.parentId;
      const parent = itemMap.get(parentId);

      if (parentId && parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(item);
      } else {
        // If parent is not found in our map (e.g. it's a workspace), it's a root item
        rootItems.push(item);
      }
    }
  }

  // Sort items: Groups first, then by name
  const sortItems = (items: CollectionItem[]) => {
    items.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'group' ? -1 : 1;
    });
    for (const item of items) {
      if (item.children) sortItems(item.children);
    }
  };

  sortItems(rootItems);
  return rootItems;
};
