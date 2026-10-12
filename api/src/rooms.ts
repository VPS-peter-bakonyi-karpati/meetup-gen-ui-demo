// The rooms of the hotel, used by the chat and the website. They are fixed, so they live in code; only the bookings
// are stored in the database. The room names are German; the descriptions are in English.
import { existsSync, readFileSync } from "node:fs";
import { serverUrl } from "./config.ts";

export interface Room {
    id: string;
    name: string;
    type: "single" | "double" | "suite" | "family";
    maxGuests: number;
    pricePerNight: number;
    view: "lake" | "mountain" | "garden" | "courtyard";
    features: string[];
    description: string;
    longDescription: string;
    /** In m² */
    size: number;
    floor: number;
    bed: string;
    imageUrl: string;
}

const roomData: Omit<Room, "imageUrl">[] = [
    {
        id: "101",
        name: "Hofzimmer",
        type: "single",
        maxGuests: 1,
        pricePerNight: 89,
        view: "courtyard",
        features: ["desk", "rain shower"],
        description: "Compact and quiet room facing the inner courtyard.",
        longDescription:
            "Our Hofzimmer is made for solo travelers who want a quiet base for exploring the lake. The room faces the inner courtyard, away from the street, and has a large desk for working and a rain shower to start the day.",
        size: 16,
        floor: 1,
        bed: "Single bed (100 × 200 cm)",
    },
    {
        id: "102",
        name: "Gartenzimmer",
        type: "double",
        maxGuests: 2,
        pricePerNight: 129,
        view: "garden",
        features: ["terrace", "queen bed"],
        description: "Ground floor room with a small private terrace to the garden.",
        longDescription:
            "The Gartenzimmer is on the ground floor and opens onto a small private terrace with two chairs. Have breakfast outside in summer, or step directly into the hotel garden with its old fruit trees.",
        size: 24,
        floor: 1,
        bed: "Queen bed (160 × 200 cm)",
    },
    {
        id: "201",
        name: "Seezimmer",
        type: "double",
        maxGuests: 2,
        pricePerNight: 159,
        view: "lake",
        features: ["balcony", "king bed"],
        description: "Bright room with a balcony overlooking the lake.",
        longDescription:
            "From the balcony of the Seezimmer you look straight over the water to the mountains on the other side. The room gets the morning sun and has a king bed with linen bedding.",
        size: 28,
        floor: 2,
        bed: "King bed (180 × 200 cm)",
    },
    {
        id: "202",
        name: "Bergzimmer",
        type: "double",
        maxGuests: 2,
        pricePerNight: 139,
        view: "mountain",
        features: ["king bed", "reading nook"],
        description: "Calm room with a view of the mountains.",
        longDescription:
            "The Bergzimmer faces the mountains behind the hotel. A reading nook by the window, with a bookshelf of regional guides and novels, makes it the quietest double room in the house.",
        size: 26,
        floor: 2,
        bed: "King bed (180 × 200 cm)",
    },
    {
        id: "203",
        name: "Familienzimmer",
        type: "family",
        maxGuests: 4,
        pricePerNight: 199,
        view: "garden",
        features: ["two bedrooms", "bathtub", "kids corner"],
        description: "Two connected bedrooms, ideal for families with kids.",
        longDescription:
            "The Familienzimmer has two bedrooms connected by a door: a double bedroom for the parents and a room with two single beds for the kids. The kids corner has games and books, and the bathroom has a bathtub.",
        size: 42,
        floor: 2,
        bed: "Queen bed and two single beds",
    },
    {
        id: "301",
        name: "Seesuite",
        type: "suite",
        maxGuests: 3,
        pricePerNight: 289,
        view: "lake",
        features: ["balcony", "sauna", "living room", "king bed"],
        description: "Top floor suite with a private sauna and panoramic lake view.",
        longDescription:
            "The Seesuite takes up the corner of the top floor, with windows on two sides and a wide balcony over the lake. It has a separate living room with a sofa bed for a third guest and a private sauna.",
        size: 55,
        floor: 3,
        bed: "King bed (180 × 200 cm) and sofa bed",
    },
    {
        id: "302",
        name: "Bergsuite",
        type: "suite",
        maxGuests: 2,
        pricePerNight: 259,
        view: "mountain",
        features: ["freestanding bathtub", "fireplace", "king bed"],
        description: "Romantic suite with a fireplace and a bathtub facing the mountains.",
        longDescription:
            "The Bergsuite is our room for couples: a fireplace in the sitting area, a freestanding bathtub in front of the window with a view of the mountains, and a king bed.",
        size: 48,
        floor: 3,
        bed: "King bed (180 × 200 cm)",
    },
];

// Absolute URLs, so the photos also load inside sandboxed iframes, e.g. of an MCP App or an open generative UI
export const rooms: Room[] = roomData.map((room) => ({ ...room, imageUrl: `${serverUrl}/room-images/${room.id}.jpg` }));

export const findRoom = (id: string) => rooms.find((room) => room.id === id);

/** The rooms that fit the guests, or all rooms */
export const listRooms = ({ guests }: { guests?: number }) =>
    guests === undefined ? rooms : rooms.filter((room) => room.maxGuests >= guests);

const imagesDir = new URL("../images/rooms/", import.meta.url);

/** The photo of a room as JPEG, or `undefined` if there is none */
export function readRoomImage(roomId: string) {
    const file = new URL(`${roomId}.jpg`, imagesDir);
    return existsSync(file) ? readFileSync(file) : undefined;
}
