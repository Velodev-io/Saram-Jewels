export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const roleService = strapi.plugin('users-permissions').service('role');
    const roles = await roleService.find();
    const publicRole = roles.find((r) => r.type === 'public');

    if (publicRole) {
      const publicPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
        where: { role: publicRole.id },
      });

      const requiredActions = [
        'api::product.product.find',
        'api::product.product.findOne',
        'api::category.category.find',
        'api::category.category.findOne'
      ];

      for (const action of requiredActions) {
        const hasPermission = publicPermissions.find(p => p.action === action);
        if (!hasPermission) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: {
              action,
              role: publicRole.id,
            },
          });
        }
      }
    }
  },
};
