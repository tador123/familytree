// @ts-ignore - Prisma Client is available in Docker container
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // @ts-ignore - console is available in Node.js
  console.log('🌱 Seeding database...');

  // Create family members
  const grandpa = await prisma.person.upsert({
    where: { id: 'grandpa-john' },
    update: {},
    create: {
      id: 'grandpa-john',
      firstName: 'John',
      lastName: 'Smith',
      birthDate: new Date('1940-03-15'),
      deathDate: new Date('2020-08-22'),
      isLiving: false,
      biography: 'A passionate storyteller and gardener who loved sharing tales from the past. His wisdom and gentle nature touched everyone he met.',
      personalityTags: ['storyteller', 'gardener', 'wise'],
      occupation: 'Farmer',
    },
  });

  const grandma = await prisma.person.upsert({
    where: { id: 'grandma-mary' },
    update: {},
    create: {
      id: 'grandma-mary',
      firstName: 'Mary',
      lastName: 'Smith',
      maidenName: 'Johnson',
      birthDate: new Date('1942-07-20'),
      deathDate: new Date('2022-01-10'),
      isLiving: false,
      biography: 'A talented musician and devoted teacher who filled our home with music and laughter. Her piano lessons were legendary.',
      personalityTags: ['musician', 'teacher', 'caring'],
      occupation: 'Music Teacher',
    },
  });

  const dad = await prisma.person.upsert({
    where: { id: 'dad-robert' },
    update: {},
    create: {
      id: 'dad-robert',
      firstName: 'Robert',
      lastName: 'Smith',
      birthDate: new Date('1965-05-10'),
      isLiving: true,
      biography: 'An innovative engineer and tech enthusiast with a love for adventure. Always ready with a joke and a helping hand.',
      personalityTags: ['engineer', 'adventurer', 'tech-savvy'],
      occupation: 'Software Engineer',
    },
  });

  const mom = await prisma.person.upsert({
    where: { id: 'mom-sarah' },
    update: {},
    create: {
      id: 'mom-sarah',
      firstName: 'Sarah',
      lastName: 'Smith',
      maidenName: 'Williams',
      birthDate: new Date('1968-09-14'),
      isLiving: true,
      biography: 'A dedicated educator and community volunteer with a heart for helping others. Her creativity and kindness inspire everyone.',
      personalityTags: ['educator', 'volunteer', 'creative'],
      occupation: 'School Principal',
    },
  });

  const uncle = await prisma.person.upsert({
    where: { id: 'uncle-michael' },
    update: {},
    create: {
      id: 'uncle-michael',
      firstName: 'Michael',
      lastName: 'Smith',
      birthDate: new Date('1970-11-03'),
      isLiving: true,
      biography: 'A master chef who brings everyone together around the table. His culinary skills and warm personality are legendary.',
      personalityTags: ['chef', 'foodie', 'sociable'],
      occupation: 'Restaurant Owner',
    },
  });

  const aunt = await prisma.person.upsert({
    where: { id: 'aunt-emma' },
    update: {},
    create: {
      id: 'aunt-emma',
      firstName: 'Emma',
      lastName: 'Smith',
      maidenName: 'Brown',
      birthDate: new Date('1972-02-18'),
      isLiving: true,
      biography: 'A creative writer and world traveler whose stories captivate audiences. Her adventurous spirit makes her unforgettable.',
      personalityTags: ['writer', 'traveler', 'creative'],
      occupation: 'Author',
    },
  });

  const child1 = await prisma.person.upsert({
    where: { id: 'child-emily' },
    update: {},
    create: {
      id: 'child-emily',
      firstName: 'Emily',
      lastName: 'Smith',
      birthDate: new Date('1995-06-22'),
      isLiving: true,
      biography: 'A talented artist with a passion for environmental causes. She brings creativity and compassion to everything she does.',
      personalityTags: ['artist', 'environmentalist', 'creative'],
      occupation: 'Graphic Designer',
    },
  });

  const child2 = await prisma.person.upsert({
    where: { id: 'child-daniel' },
    update: {},
    create: {
      id: 'child-daniel',
      firstName: 'Daniel',
      lastName: 'Smith',
      birthDate: new Date('1998-04-15'),
      isLiving: true,
      biography: 'An aspiring musician following in his grandmother\'s footsteps. His guitar skills and songwriting talent shine bright.',
      personalityTags: ['musician', 'songwriter', 'performer'],
      occupation: 'Music Producer',
    },
  });

  // Create relationships
  // Grandparents marriage
  await prisma.relationship.upsert({
    where: { id: 'rel-grandparents' },
    update: {},
    create: {
      id: 'rel-grandparents',
      personFromId: grandpa.id,
      personToId: grandma.id,
      relationshipType: 'spouse',
    },
  });

  // Parents marriage
  await prisma.relationship.upsert({
    where: { id: 'rel-parents' },
    update: {},
    create: {
      id: 'rel-parents',
      personFromId: dad.id,
      personToId: mom.id,
      relationshipType: 'spouse',
    },
  });

  // Uncle-Aunt marriage
  await prisma.relationship.upsert({
    where: { id: 'rel-uncle-aunt' },
    update: {},
    create: {
      id: 'rel-uncle-aunt',
      personFromId: uncle.id,
      personToId: aunt.id,
      relationshipType: 'spouse',
    },
  });

  // Dad is child of grandparents
  await prisma.relationship.upsert({
    where: { id: 'rel-dad-grandpa' },
    update: {},
    create: {
      id: 'rel-dad-grandpa',
      personFromId: dad.id,
      personToId: grandpa.id,
      relationshipType: 'child',
    },
  });

  await prisma.relationship.upsert({
    where: { id: 'rel-dad-grandma' },
    update: {},
    create: {
      id: 'rel-dad-grandma',
      personFromId: dad.id,
      personToId: grandma.id,
      relationshipType: 'child',
    },
  });

  // Uncle is child of grandparents
  await prisma.relationship.upsert({
    where: { id: 'rel-uncle-grandpa' },
    update: {},
    create: {
      id: 'rel-uncle-grandpa',
      personFromId: uncle.id,
      personToId: grandpa.id,
      relationshipType: 'child',
    },
  });

  await prisma.relationship.upsert({
    where: { id: 'rel-uncle-grandma' },
    update: {},
    create: {
      id: 'rel-uncle-grandma',
      personFromId: uncle.id,
      personToId: grandma.id,
      relationshipType: 'child',
    },
  });

  // Children are children of parents
  await prisma.relationship.upsert({
    where: { id: 'rel-emily-dad' },
    update: {},
    create: {
      id: 'rel-emily-dad',
      personFromId: child1.id,
      personToId: dad.id,
      relationshipType: 'child',
    },
  });

  await prisma.relationship.upsert({
    where: { id: 'rel-emily-mom' },
    update: {},
    create: {
      id: 'rel-emily-mom',
      personFromId: child1.id,
      personToId: mom.id,
      relationshipType: 'child',
    },
  });

  await prisma.relationship.upsert({
    where: { id: 'rel-daniel-dad' },
    update: {},
    create: {
      id: 'rel-daniel-dad',
      personFromId: child2.id,
      personToId: dad.id,
      relationshipType: 'child',
    },
  });

  await prisma.relationship.upsert({
    where: { id: 'rel-daniel-mom' },
    update: {},
    create: {
      id: 'rel-daniel-mom',
      personFromId: child2.id,
      personToId: mom.id,
      relationshipType: 'child',
    },
  });

  // @ts-ignore - console is available in Node.js
  console.log('✅ Seeding completed!');
  // @ts-ignore
  console.log(`Created ${await prisma.person.count()} people`);
  // @ts-ignore
  console.log(`Created ${await prisma.relationship.count()} relationships`);
}

main()
  .catch((e) => {
    // @ts-ignore - console is available in Node.js
    console.error('❌ Seeding failed:', e);
    // @ts-ignore - process is available in Node.js
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
