import {
  db,
  usersTable,
  requestsTable,
  responsesTable,
  threadsTable,
  messagesTable,
} from "@workspace/db";
import { randomUUID } from "node:crypto";

async function reset() {
  await db.delete(messagesTable);
  await db.delete(threadsTable);
  await db.delete(responsesTable);
  await db.delete(requestsTable);
  await db.delete(usersTable);
}

const PORTRAIT_BASE = "https://images.unsplash.com/";
function pic(seed: string) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=fde68a,fbcfe8,bfdbfe,bbf7d0,fed7aa`;
}

const usersSeed = [
  {
    id: randomUUID(),
    name: "Maya Patel",
    handle: "mayap",
    avatarUrl: pic("Maya"),
    bio: "Vintage camera collector. Always hunting for film gear and quirky lenses.",
    location: "Brooklyn, NY",
  },
  {
    id: randomUUID(),
    name: "Theo Larsen",
    handle: "theo_l",
    avatarUrl: pic("Theo"),
    bio: "Woodworker who restores mid-century furniture. I have a garage full of finds.",
    location: "Portland, OR",
  },
  {
    id: randomUUID(),
    name: "June Okafor",
    handle: "june.o",
    avatarUrl: pic("June"),
    bio: "New mom rebuilding our home library. Books, picture frames, anything cozy.",
    location: "Atlanta, GA",
  },
  {
    id: randomUUID(),
    name: "Rafael Cruz",
    handle: "rafa",
    avatarUrl: pic("Rafael"),
    bio: "Bike mechanic by day, estate sale hawk by weekend. DM me your wheelset wishlist.",
    location: "Austin, TX",
  },
  {
    id: randomUUID(),
    name: "Sasha Kim",
    handle: "sashak",
    avatarUrl: pic("Sasha"),
    bio: "Plant person and ceramics nerd. Trying to furnish a tiny apartment beautifully.",
    location: "Oakland, CA",
  },
];

async function seed() {
  await reset();
  await db.insert(usersTable).values(usersSeed);

  const [maya, theo, june, rafa, sasha] = usersSeed;

  type Req = {
    id: string;
    buyerId: string;
    title: string;
    description: string;
    category: string;
    budgetMin?: string;
    budgetMax?: string;
    location: string;
    urgency: string;
    status: string;
    tags: string[];
    daysAgo: number;
  };

  const reqs: Req[] = [
    {
      id: randomUUID(),
      buyerId: maya.id,
      title: "Pentax K1000 in good working condition",
      description:
        "Looking for a used Pentax K1000 35mm SLR, ideally with the standard 50mm f/2 lens. Cosmetic wear is fine — just need shutter speeds and meter to be accurate. Will pick up anywhere in NYC, can also pay shipping.",
      category: "Cameras",
      budgetMin: "120",
      budgetMax: "220",
      location: "Brooklyn, NY",
      urgency: "normal",
      status: "open",
      tags: ["film", "35mm", "vintage"],
      daysAgo: 0,
    },
    {
      id: randomUUID(),
      buyerId: june.id,
      title: "Bookshelf — solid wood, around 6ft tall",
      description:
        "Rebuilding our living room library. Looking for a sturdy solid wood bookshelf, roughly 6ft tall and 30-36in wide. Walnut or oak ideal. No flat-pack particle board please. Can pick up within an hour of Atlanta.",
      category: "Furniture",
      budgetMin: "80",
      budgetMax: "300",
      location: "Atlanta, GA",
      urgency: "low",
      status: "open",
      tags: ["bookshelf", "solid-wood", "atlanta"],
      daysAgo: 1,
    },
    {
      id: randomUUID(),
      buyerId: rafa.id,
      title: "Shimano 105 R7000 groupset, 11-speed",
      description:
        "Building up a steel road bike for a friend. Need a complete or nearly complete Shimano 105 R7000 groupset — crank (170 or 172.5), shifters, derailleurs, brakes. Used is fine. No 5800 or older please.",
      category: "Bikes",
      budgetMin: "250",
      budgetMax: "450",
      location: "Austin, TX",
      urgency: "high",
      status: "open",
      tags: ["road-bike", "shimano", "groupset"],
      daysAgo: 0,
    },
    {
      id: randomUUID(),
      buyerId: sasha.id,
      title: "Mid-century ceramic planter, 8-12in diameter",
      description:
        "Hunting for a real mid-century ceramic planter — Bauer, Architectural Pottery, Gainey, or in that spirit. Needs a drainage hole. Earthy glazes preferred (cream, sand, moss). Open to chips on the bottom.",
      category: "Home & Garden",
      budgetMin: "40",
      budgetMax: "150",
      location: "Oakland, CA",
      urgency: "normal",
      status: "open",
      tags: ["mid-century", "pottery", "plants"],
      daysAgo: 2,
    },
    {
      id: randomUUID(),
      buyerId: theo.id,
      title: "Lie-Nielsen No. 4 smoothing plane",
      description:
        "Looking to add a Lie-Nielsen No. 4 to the bench. Bronze or iron body both fine. Must have the original blade. Willing to pay close to retail for one in great shape.",
      category: "Tools",
      budgetMin: "300",
      budgetMax: "425",
      location: "Portland, OR",
      urgency: "low",
      status: "open",
      tags: ["hand-tools", "woodworking"],
      daysAgo: 3,
    },
    {
      id: randomUUID(),
      buyerId: june.id,
      title: "Wooden picture frames, 8x10 and 11x14",
      description:
        "Need a set of 4-6 wooden picture frames in mixed sizes (mostly 8x10, a couple 11x14). Plain dark wood or natural. Doesn't have to be a matching set — eclectic is good.",
      category: "Home & Garden",
      budgetMax: "60",
      location: "Atlanta, GA",
      urgency: "normal",
      status: "open",
      tags: ["frames", "decor"],
      daysAgo: 1,
    },
    {
      id: randomUUID(),
      buyerId: maya.id,
      title: "Old issues of National Geographic from the 70s",
      description:
        "Doing a collage project. Looking for a stack (10+) of National Geographic magazines from 1970-1979. Condition doesn't matter as long as the photos are intact.",
      category: "Books & Media",
      budgetMax: "40",
      location: "Brooklyn, NY",
      urgency: "low",
      status: "open",
      tags: ["magazines", "vintage", "art"],
      daysAgo: 4,
    },
    {
      id: randomUUID(),
      buyerId: sasha.id,
      title: "Espresso machine — Gaggia Classic or similar",
      description:
        "Trying to upgrade from a Moka pot. Looking for a Gaggia Classic, Rancilio Silvia, or similar entry-level prosumer machine. PID mod is a bonus, not required.",
      category: "Kitchen",
      budgetMin: "150",
      budgetMax: "350",
      location: "Oakland, CA",
      urgency: "high",
      status: "open",
      tags: ["coffee", "espresso"],
      daysAgo: 0,
    },
    {
      id: randomUUID(),
      buyerId: rafa.id,
      title: "Old Apple iMac G3 (any color, working or not)",
      description:
        "Childhood nostalgia project. Looking for an iMac G3 — bondi blue, tangerine, grape, anything. Working is great, dead is fine if the shell is intact. Local pickup preferred but I'll pay shipping.",
      category: "Electronics",
      budgetMin: "30",
      budgetMax: "180",
      location: "Austin, TX",
      urgency: "low",
      status: "open",
      tags: ["retro", "apple", "nostalgia"],
      daysAgo: 5,
    },
  ];

  for (const r of reqs) {
    await db.insert(requestsTable).values({
      id: r.id,
      buyerId: r.buyerId,
      title: r.title,
      description: r.description,
      category: r.category,
      budgetMin: r.budgetMin ?? null,
      budgetMax: r.budgetMax ?? null,
      location: r.location,
      urgency: r.urgency,
      status: r.status,
      tags: r.tags,
      createdAt: new Date(Date.now() - r.daysAgo * 24 * 60 * 60 * 1000),
    });
  }

  // Helper to get an image
  function img(seed: string, w = 800) {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${w}`;
  }

  const responsesSeed = [
    {
      requestId: reqs[0].id,
      sellerId: theo.id,
      price: 175,
      condition: "good",
      message:
        "Have one in our shop — meter is dead-on, shutter sounds healthy at all speeds. Comes with the 50mm f/2 SMC. Some brassing on the top plate, leatherette is intact.",
      photos: [img("pentax-1"), img("pentax-2")],
      hoursAgo: 4,
    },
    {
      requestId: reqs[0].id,
      sellerId: rafa.id,
      price: 140,
      condition: "fair",
      message:
        "Mine has a sticky 1/15 speed but everything else works. Lens has light haze. Honest beater — perfect for a student.",
      photos: [img("pentax-3")],
      hoursAgo: 14,
    },
    {
      requestId: reqs[1].id,
      sellerId: theo.id,
      price: 220,
      condition: "good",
      message:
        "Restored a 1960s walnut bookcase — 5.5ft tall, 32in wide, four adjustable shelves. Refinished with hardwax oil. Can deliver within Atlanta for $40.",
      photos: [img("shelf-1"), img("shelf-2"), img("shelf-3")],
      hoursAgo: 6,
    },
    {
      requestId: reqs[2].id,
      sellerId: theo.id,
      price: 380,
      condition: "like_new",
      message:
        "Pulled a complete R7000 off a frame I parted out. ~600 miles total. Shifters, both derailleurs, 50/34 crank (172.5), brakes, cassette. Chain not included.",
      photos: [img("groupset-1"), img("groupset-2")],
      hoursAgo: 2,
    },
    {
      requestId: reqs[3].id,
      sellerId: maya.id,
      price: 65,
      condition: "good",
      message:
        "Have a real Architectural Pottery 10in planter, sand glaze, drainage hole. Tiny chip on the foot — invisible once it's potted.",
      photos: [img("planter-1")],
      hoursAgo: 24,
    },
    {
      requestId: reqs[4].id,
      sellerId: rafa.id,
      price: 350,
      condition: "like_new",
      message:
        "Bought a Lie-Nielsen No. 4 last year, used it twice. Bronze body, iron blade sharpened once. Original box.",
      photos: [img("plane-1"), img("plane-2")],
      hoursAgo: 30,
    },
    {
      requestId: reqs[5].id,
      sellerId: sasha.id,
      price: 45,
      condition: "good",
      message:
        "Have a mixed lot of six wooden frames — three 8x10, two 11x14, one 5x7. All real wood, mostly walnut and natural pine. Glass intact.",
      photos: [img("frames-1")],
      hoursAgo: 18,
    },
    {
      requestId: reqs[7].id,
      sellerId: theo.id,
      price: 240,
      condition: "good",
      message:
        "Selling my Gaggia Classic Pro — about 3 years old. Pulls great shots, no leaks. Includes the stock portafilter and a bottomless one I added.",
      photos: [img("gaggia-1"), img("gaggia-2")],
      hoursAgo: 1,
    },
  ];

  const respIds: { id: string; requestId: string; sellerId: string }[] = [];
  for (const r of responsesSeed) {
    const id = randomUUID();
    respIds.push({ id, requestId: r.requestId, sellerId: r.sellerId });
    await db.insert(responsesTable).values({
      id,
      requestId: r.requestId,
      sellerId: r.sellerId,
      price: r.price.toString(),
      condition: r.condition,
      message: r.message,
      photos: r.photos,
      status: "pending",
      createdAt: new Date(Date.now() - r.hoursAgo * 60 * 60 * 1000),
    });
  }

  // Accept the response on request[2] (Rafa's groupset, accepted Theo's offer) → creates a thread
  const groupsetResp = respIds.find(
    (r) => r.requestId === reqs[2].id && r.sellerId === theo.id,
  )!;
  const threadId = randomUUID();
  await db.insert(threadsTable).values({
    id: threadId,
    requestId: reqs[2].id,
    responseId: groupsetResp.id,
  });
  await db
    .update(responsesTable)
    .set({ status: "accepted", threadId })
    .where(eqHelper(groupsetResp.id));
  await db.insert(messagesTable).values([
    {
      id: randomUUID(),
      threadId,
      senderId: rafa.id,
      body: "Sweet, this looks perfect. Can you ship to Austin? Box it well — the crank arms tend to bang around.",
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
    },
    {
      id: randomUUID(),
      threadId,
      senderId: theo.id,
      body: "Yep, I'll wrap each piece individually and double-box. UPS Ground is about $32 from Portland.",
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: randomUUID(),
      threadId,
      senderId: rafa.id,
      body: "Works for me. I'll send payment as soon as you have a tracking number.",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ]);

  console.log("Seeded:", {
    users: usersSeed.length,
    requests: reqs.length,
    responses: responsesSeed.length,
    threads: 1,
  });
}

import { eq } from "drizzle-orm";
function eqHelper(id: string) {
  return eq(responsesTable.id, id);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
