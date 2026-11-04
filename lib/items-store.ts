export type StoreItem = {
  id: number;
  name: string;
  category: "Necklaces" | "Earrings" | "Rings" | "Bracelets";
  price: number;
  image: string;
};

const initialItems: StoreItem[] = [
  { id: 1, name: "Dainty Pearl Drop", category: "Earrings", price: 420, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85" },
  { id: 2, name: "Mariposa Pendant", category: "Necklaces", price: 580, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85" },
  { id: 3, name: "Golden Hour Hoops", category: "Earrings", price: 360, image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=900&q=85" },
  { id: 4, name: "Petit Signet Ring", category: "Rings", price: 320, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85" },
  { id: 5, name: "Candy Heart Chain", category: "Necklaces", price: 640, image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85" },
  { id: 6, name: "Lucky Clover Cuff", category: "Bracelets", price: 480, image: "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?auto=format&fit=crop&w=900&q=85" },
];

const itemsKey = Symbol.for("girly-gems.items-store");
const store = globalThis as typeof globalThis & { [itemsKey]?: StoreItem[] };

if (!store[itemsKey]) {
  store[itemsKey] = initialItems.map((item) => ({ ...item }));
}

export function getItems() {
  return [...store[itemsKey]!].map((item) => ({ ...item }));
}

export function addItem(input: Omit<StoreItem, "id">) {
  const items = store[itemsKey]!;
  const nextId = items.reduce((largest, item) => Math.max(largest, item.id), 0) + 1;
  const item = { id: nextId, ...input };
  items.push(item);
  return { ...item };
}

export function updateItem(id: number, input: Partial<Omit<StoreItem, "id">>) {
  const items = store[itemsKey]!;
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  items[index] = { ...items[index], ...input };
  return { ...items[index] };
}

export function removeItem(id: number) {
  const items = store[itemsKey]!;
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}
