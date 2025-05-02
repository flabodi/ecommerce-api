import type { Schema, Struct } from '@strapi/strapi';

export interface DrinkInfoGenerali extends Struct.ComponentSchema {
  collectionName: 'components_drink_info_generalis';
  info: {
    displayName: 'info-generali';
  };
  attributes: {
    grado_alcolico: Schema.Attribute.Integer;
    volume_ml: Schema.Attribute.Integer;
  };
}

export interface ProductIngredients extends Struct.ComponentSchema {
  collectionName: 'components_product_ingredients';
  info: {
    displayName: 'ingredients';
  };
  attributes: {
    name: Schema.Attribute.String;
    quantity: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'drink.info-generali': DrinkInfoGenerali;
      'product.ingredients': ProductIngredients;
    }
  }
}
