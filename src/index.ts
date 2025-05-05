import fs from 'fs/promises';
import path from 'path';

export default {
  async bootstrap({ strapi }: { strapi: any }) {
    const seeds = [
      { uid: 'api::categorie.categorie',           file: 'categories.json' },
      { uid: 'api::product.product',               file: 'products.json'   },
      { uid: 'api::tips-and-story.tips-and-story', file: 'tips.json'       },
    ];

    for (const { uid, file } of seeds) {
      // 1) Conta i record già presenti
      const count = await strapi.db.query(uid).count();
      if (count > 0) {
        strapi.log.info(`[bootstrap] "${uid}" già popolato (${count}), skip.`);
        continue;
      }

      // 2) Carica il JSON
      const dataPath = path.join(strapi.dirs.root, 'data', file);
      let items: any[];
      try {
        const raw = await fs.readFile(dataPath, 'utf8');
        const parsed = JSON.parse(raw);
        // Se il JSON ha { data: [...] }
        items = parsed.data ?? parsed;
      } catch (err) {
        strapi.log.error(`[bootstrap] non trovo ${file}: ${err.message}`);
        continue;
      }

      // 3) Crea ogni entry
      for (const item of items) {
        const attrs = item.attributes ?? item;
        await strapi.entityService.create(uid, { data: attrs });
      }

      strapi.log.info(`[bootstrap] importati ${items.length} record in "${uid}"`);
    }
  },
};
