// Hotel tools of the demos, on top of the hotel API (`api/`). All demos share them; they only differ in
// how the chat frontend presents the results.
import { defineTool } from "@copilotkit/runtime/v2";
import { z } from "zod";
import { hotelApiUrl } from "./config.ts";

export const HOTEL_NAME = "Hotel Seeblick";

/** Calls the hotel API; its error messages are thrown, so they reach the model */
async function hotelApi<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${hotelApiUrl}/api/hotel${path}`, init);
    } catch {
        throw new Error("The hotel API is not reachable.");
    }
    const body = (await response.json().catch(() => undefined)) as { error?: string } | undefined;
    if (!response.ok) {
        throw new Error(body?.error ?? `The hotel API answered with ${response.status}.`);
    }
    return body as T;
}

type Stay = { checkIn: string; checkOut: string; guests: number };

const query = (params: Record<string, string | number>) =>
    new URLSearchParams(Object.entries(params).map(([key, value]): [string, string] => [key, String(value)])).toString();

export const searchRooms = (stay: Stay) => hotelApi<object[]>(`/availability?${query(stay)}`);

export const createBooking = (input: Stay & { roomId: string; guestName: string }) =>
    hotelApi<object>("/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

// Tells the model about groups that are too large for any single room, instead of letting
// it read an empty result as "nothing available".
async function tooLargeForOneRoom(guests: number) {
    const rooms = await hotelApi<object[]>(`/rooms?${query({ guests })}`);
    if (rooms.length > 0) {
        return undefined;
    }
    return `No single room fits ${guests} guests. Suggest a combination of rooms whose maxGuests add up to at least ${guests}, and show all rooms of the combination together.`;
}

// Tool errors go back to the model as text, so it can explain them to the user.
const safely =
    <TArgs>(fn: (args: TArgs) => unknown) =>
    async (args: TArgs) => {
        try {
            return await fn(args);
        } catch (error) {
            return { error: error instanceof Error ? error.message : String(error) };
        }
    };

const stay = {
    checkIn: z.string().describe("Check-in date, YYYY-MM-DD"),
    checkOut: z.string().describe("Check-out date, YYYY-MM-DD"),
    guests: z.number().int().min(1),
};

export const hotelTools = {
    listRooms: defineTool({
        name: "list_rooms",
        description:
            "Lists the rooms with their features and price per night, without checking availability. Use it for recommendations. Pass the number of guests if known; then only rooms that fit them are returned.",
        parameters: z.object({ guests: z.number().int().min(1).optional() }),
        execute: safely(async ({ guests }: { guests?: number }) => {
            const note = guests === undefined ? undefined : await tooLargeForOneRoom(guests);
            const rooms = await hotelApi<object[]>(guests === undefined || note ? "/rooms" : `/rooms?${query({ guests })}`);
            return note ? { rooms, note } : { rooms };
        }),
    }),
    searchRooms: defineTool({
        name: "search_rooms",
        description:
            "Lists the rooms that are available for the given stay, with their total price. For a combination of rooms, search once per room with the guests staying in it.",
        parameters: z.object(stay),
        execute: safely(async (input: Stay) => {
            const note = await tooLargeForOneRoom(input.guests);
            return note ? { rooms: [], note } : { rooms: await searchRooms(input) };
        }),
    }),
    bookRoom: defineTool({
        name: "book_room",
        description: "Books a room. Only call this when the user explicitly asked to book.",
        parameters: z.object({ roomId: z.string(), guestName: z.string(), ...stay }),
        execute: safely(createBooking),
    }),
    listBookings: defineTool({
        name: "list_bookings",
        description: "Lists the bookings made under the given guest name.",
        parameters: z.object({ guestName: z.string() }),
        execute: safely(({ guestName }: { guestName: string }) => hotelApi(`/bookings?${query({ guestName })}`)),
    }),
    cancelBooking: defineTool({
        name: "cancel_booking",
        description: "Cancels a booking. The guest name must match the name on the booking.",
        parameters: z.object({ bookingId: z.number().int(), guestName: z.string() }),
        execute: safely(({ bookingId, guestName }: { bookingId: number; guestName: string }) =>
            hotelApi(`/bookings/${bookingId}?${query({ guestName })}`, { method: "DELETE" }),
        ),
    }),
};
