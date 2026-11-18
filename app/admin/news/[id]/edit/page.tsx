import { notFound } from 'next/navigation'; import ArticleForm from '@/components/ArticleForm'; import { getArticleById, getCategories, getAuthors } from '@/lib/store';
export const dynamic = 'force-dynamic';
export default async function EditArticle({ params }: { params: { id: string } }) { const a = await getArticleById(params.id); if (!a) notFound(); return (<div><h1 className="text-2xl font-black mb-4">সংবাদ সম্পাদনা</h1><ArticleForm initial={a} categories={await getCategories()} authors={await getAuthors()} /></div>); }
