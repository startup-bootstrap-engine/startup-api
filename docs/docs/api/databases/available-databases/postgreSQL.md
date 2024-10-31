# PostgreSQL

This project has a module to activate PostgreSQL as the database and Prisma as the ORM. Follow these steps to set up, access, and visualize your data.

## Setup

1. Ensure you have Docker and Docker Compose installed on your system.

2. In your `.env` file, confirm the following variables are set:

   ```
   # Modules
   MODULE_POSTGRESQL=true

   # PostgreSQL
   POSTGRES_HOST_CONTAINER=startup-postgresql
   POSTGRES_PORT=5432
   POSTGRES_DB=startup-postgresql
   POSTGRES_USER=admin
   POSTGRES_PASSWORD=31416
   POSTGRESQL_DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST_CONTAINER}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
   POSTGRESQL_PGADMIN_EMAIL=startup@admin.com
   POSTGRESQL_PGADMIN_PASSWORD=admin
   ```

3. Run the following command to start the PostgreSQL and pgAdmin containers:

   ```
   yarn module:build
   ```

4. Generate the Prisma client:

   ```
   yarn db:prisma:generate
   ```

## Visualizing Data

### Requirements

- `MODULE_POSTGRESQL` activated in your `.env` file

### Using Prisma Studio

This is the easiest way to visualize your data. Simply activate the module `MODULE_PRISMA_STUDIO` in your `.env` file and run `yarn module:build`.

Afterwards, check your browser at `http://localhost:5555/` to see the Prisma Studio interface.

### Using pgAdmin

pgAdmin is a powerful administration and development platform for PostgreSQL.

Initially, make sure you have the `MODULE_PGADMIN` activated in your `.env` file.

Follow these steps to use it:

1. Access pgAdmin:

   - Open your web browser and navigate to `http://localhost:5050`
   - Log in using the email and password you set in the `POSTGRESQL_PGADMIN_EMAIL` and `POSTGRESQL_PGADMIN_PASSWORD` environment variables.

2. Add a new server:

   - Right-click on "Servers" in the left sidebar and select "Create" > "Server".
   - In the "General" tab, give your server a name (e.g., "Startup PostgreSQL").
   - Switch to the "Connection" tab and enter the following details:
     - Host name/address: `startup-postgresql`
     - Port: `5432`
     - Maintenance database: `startup-postgresql`
     - Username: `admin`
     - Password: `31416`
   - Click "Save" to connect to your database.

3. Explore your database:

   - Expand your server in the left sidebar to see your databases.
   - Expand your database to see tables, views, and other database objects.
   - Right-click on a table and select "View/Edit Data" > "All Rows" to see the table contents.

4. Run custom queries:

   - Click on "Tools" > "Query Tool" to open a SQL editor.
   - Write your SQL query and click the "Execute" button (or press F5) to run it.

5. Visualize data:
   - After running a query, click on the "Charts" tab in the results pane.
   - Choose a chart type and configure the axes to visualize your data graphically.

Remember to be cautious when making changes to your database, especially in a production environment.

## Troubleshooting

If you encounter any issues:

1. Ensure all containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs startup-postgresql`. Easier to just check on Docker Desktop
3. Verify your `.env` file settings
4. Ensure Prisma schema is up-to-date: `npx prisma generate`
5. Run migrations again: `npx prisma migrate dev`

For more detailed information on using Prisma, refer to the [Prisma documentation](https://www.prisma.io/docs/).
