import SimpleCrud from '@/components/SimpleCrud'; import { getCategories } from '@/lib/store';
export const dynamic='force-dynamic';
export default async function Cats(){ return <SimpleCrud endpoint="/api/admin/categories" title="বিভাগ ব্যবস্থাপনা" fields={[{key:'name',label:'Name (English)'},{key:'nameBn',label:'নাম (বাংলা)'},{key:'slug',label:'Slug'},{key:'description',label:'বিবরণ'},{key:'color',label:'রং (hex)'}]} items={await getCategories()} />; }
