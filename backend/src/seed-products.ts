import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');

  // 1. Ensure Categories Exist
  const coffeeCategory = await prisma.category.upsert({
    where: { slug: 'coffee' },
    update: {},
    create: { name: 'Coffee', slug: 'coffee', description: 'Premium beans' },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', description: 'Luxury tools' },
  });

  // 2. Create Products
  const products = [
    {
      name: 'Ethiopian Origin',
      slug: 'ethiopian-origin',
      description: 'Floral & Citrus notes. Washed process. Altitude 2000m-2200m.',
      price: 125.00,
      stock: 50,
      categoryId: coffeeCategory.id,
      images: ['/products/1.jpg']
    },
    {
        name: 'Colombian Roast',
        slug: 'colombian-roast',
        description: 'Smooth chocolate body with hints of caramel.',
        price: 95.00,
        stock: 50,
        categoryId: coffeeCategory.id,
        images: ['/products/2.jpg']
    },
    {
        name: 'Miyaar Signature Blend',
        slug: 'miyaar-signature',
        description: 'Our award-winning house blend. Perfectly balanced.',
        price: 110.00,
        stock: 100,
        categoryId: coffeeCategory.id,
        images: ['/products/3.jpg']
    },
    {
        name: 'Miyaar Travel Tumbler',
        slug: 'travel-tumbler',
        description: 'Matte black vacuum insulated tumbler. Keeps coffee hot for 6 hours.',
        price: 145.00,
        stock: 30,
        categoryId: accessoriesCategory.id,
        images: ['/products/4.jpg']
    },
    {
        name: 'Miyaar Gift Box',
        slug: 'miyaar-gift-box',
        description: 'The ultimate luxury gift. Includes beans, mug, and accessories.',
        price: 350.00,
        stock: 10,
        categoryId: accessoriesCategory.id,
        images: ['/products/5.png']
    },
      {
        name: 'Ceramic Tasting Cup',
        slug: 'ceramic-cup',
        description: 'Handcrafted ceramic cup designed to enhance aroma.',
        price: 65.00,
        stock: 10,
        categoryId: accessoriesCategory.id,
        images: ['/products/6.png']
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        images: p.images, // Update images if they changed
        price: p.price,
        categoryId: p.categoryId
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        stock: p.stock,
        categoryId: p.categoryId,
        images: p.images
      },
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
