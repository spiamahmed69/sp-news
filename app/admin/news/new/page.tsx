import ArticleForm from '@/components/ArticleForm'; import { getCategories, getAuthors } from '@/lib/store';
export default async function NewArticle() { return (<div><h1 className="text-2xl font-black mb-4">নতুন সংবাদ</h1><ArticleForm categories={await getCategories()} authors={await getAuthors()} /></div>); }
