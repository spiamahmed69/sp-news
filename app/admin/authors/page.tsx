import SimpleCrud from '@/components/SimpleCrud'; import { getAuthors } from '@/lib/store';
export const dynamic='force-dynamic';
export default async function Authors(){ return <SimpleCrud endpoint="/api/admin/authors" title="লেখক ব্যবস্থাপনা" fields={[{key:'name',label:'Name'},{key:'nameBn',label:'নাম (বাংলা)'},{key:'slug',label:'Slug'},{key:'role',label:'পদবি'},{key:'bio',label:'জীবনী'},{key:'avatar',label:'ছবির URL'}]} items={await getAuthors()} />; }
