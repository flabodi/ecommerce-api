import fs from 'fs/promises';
import path from 'path';

export default {
  async bootstrap({ strapi }: { strapi: any }) {
    const seeds = [
      { uid: 'api::categorie.categorie',           file: 'categories.json' },
      { uid: 'api::product.product',               file: 'products.json'   },
      { uid: 'api::tips-and-story.tips-and-story', file: 'tips.json'       },
    ];

    const projectRoot = process.cwd();

    for (const { uid, file } of seeds) {
      const count = await strapi.db.query(uid).count();
      if (count > 0) {
        strapi.log.info(`[bootstrap] "${uid}" già popolato (${count}), skip.`);
        continue;
      }

      const dataPath = path.join(projectRoot, 'data', file);
      let items: any[];
      try {
        const raw = await fs.readFile(dataPath, 'utf8');
        const parsed = JSON.parse(raw);
        items = parsed.data ?? parsed;
      } catch (err: any) {
        strapi.log.error(`[bootstrap] non trovo ${file}: ${err.message}`);
        continue;
      }

      for (const item of items) {
        const attrs = item.attributes ?? item;
        // Prepara i dati, includendo la relazione category per i products
        let dataToCreate: any = { ...attrs };
        if (uid === 'api::product.product') {
          const categoryRel = attrs.category?.data?.id;
          if (categoryRel) {
            dataToCreate.category = categoryRel;
          }
          delete dataToCreate.category?.data;
        }

        await strapi.entityService.create(uid, { data: dataToCreate });
      }

      strapi.log.info(`[bootstrap] importati ${items.length} record in "${uid}"`);
    }
  },
};
