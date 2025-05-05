// src/index.ts
import fs from 'fs/promises';
import path from 'path';

export default {
  async bootstrap({ strapi }: { strapi: any }) {
    const seeds = [
      { uid: 'api::categorie.categorie',           file: 'categories.json' },
      { uid: 'api::product.product',               file: 'products.json'   },
      { uid: 'api::tips-and-story.tips-and-story', file: 'tips.json'       },
    ];

    // prendo la root del progetto
    const projectRoot = process.cwd();

    for (const { uid, file } of seeds) {
      // 1) conto le entry già presenti
      const count = await strapi.db.query(uid).count();
      if (count > 0) {
        strapi.log.info(`[bootstrap] "${uid}" già popolato (${count}), skip.`);
        continue;
      }

      // 2) costruisco il path usando projectRoot anziché strapi.dirs.root
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

      // 3) creo ogni entry
      for (const item of items) {
        const attrs = item.attributes ?? item;
        await strapi.entityService.create(uid, { data: attrs });
      }
      strapi.log.info(`[bootstrap] importati ${items.length} record in "${uid}"`);
    }
  },
};
