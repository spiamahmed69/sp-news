export type ArticleStatus = 'draft' | 'published' | 'scheduled';
export interface Article { id:string; title:string; titleEn?:string; slug:string; excerpt:string; content:string; categorySlug:string; authorSlug:string; tags:string[]; featuredImage:string; gallery:string[]; status:ArticleStatus; featured:boolean; breaking:boolean; views:number; publishedAt:string; seoTitle?:string; seoDescription?:string; isSample?:boolean; }
export interface Category { id:string; name:string; nameBn:string; slug:string; description?:string; color?:string; }
export interface Author { id:string; name:string; nameBn:string; slug:string; role:string; bio?:string; avatar?:string; }
export interface Ad { id:string; title:string; slot:string; imageUrl:string; linkUrl:string; active:boolean; }
export interface SiteSettings { siteName:string; siteNameBn:string; tagline:string; description:string; logoText:string; contactEmail:string; contactPhone:string; address:string; facebook:string; twitter:string; youtube:string; seoTitle:string; seoDescription:string; }
export interface ContactMessage { id:string; name:string; email:string; subject?:string; message:string; createdAt:string; read:boolean; }
export interface NewsletterSubscriber { id:string; email:string; createdAt:string; }
export interface SeedData { settings:SiteSettings; categories:Category[]; authors:Author[]; ads:Ad[]; users:{id:string;name:string;email:string;role:string;createdAt:string}[]; articles:Article[]; contactMessages:ContactMessage[]; newsletterSubscribers:NewsletterSubscriber[]; homepageSections:{id:string;key:string;title:string;titleEn:string;enabled:boolean;order:number}[]; }
