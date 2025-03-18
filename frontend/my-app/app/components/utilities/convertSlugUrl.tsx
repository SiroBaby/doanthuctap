import slugify from 'slugify';

export const convertSlugUrl = (slug: string) => {
    if(!slug) return '';
    const str = slugify(slug, {
        lower: true,
        locale: 'vi',
        remove: /[*+~.()'"!:@]/g,
    });
    return str;
};
