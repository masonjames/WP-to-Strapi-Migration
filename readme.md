# WordPress to Strapi Migration Tool

This tool facilitates the migration of content from WordPress to Strapi, including support for custom post types, Yoast SEO data, and Advanced Custom Fields (ACF).

## Features

- Fetches content from WordPress using the REST API
- Supports standard and custom post types
- Integrates Yoast SEO data migration
- Handles Advanced Custom Fields (ACF) data
- Performs basic SEO analysis
- Maps WordPress content to Strapi format

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- Access to a WordPress site with REST API enabled
- Strapi instance set up and running

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/masonjames/wp-to-strapi-migration.git
   ```
2. Navigate to the project directory:
   ```
   cd wp-to-strapi-migration
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Usage

1. Run the migration tool:
   ```
   npm start
   ```
2. Follow the prompts to enter your WordPress site URL, credentials, and migration preferences.

## Configuration

- Modify `src/config.js` to adjust default settings or API endpoints.
- Custom post type mappings can be added in `src/mappers/intermediate.js`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.