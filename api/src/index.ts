// REST API of the hotel for the chat demos (`chat/`) and the website (`website/`), so both share the bookings.
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { port, serverUrl } from "./config.ts";
import { cancelBooking, createBooking, listBookings, listOccupancy, searchRooms } from "./bookings.ts";
import { hotel as hotelDetails } from "./hotel.ts";
import { listRooms, readRoomImage } from "./rooms.ts";

const optionalNumber = (value: string | undefined) => (value === undefined ? undefined : Number(value));

const hotel = new Hono()
    .get("/", (c) => c.json(hotelDetails))
    .get("/rooms", (c) => c.json(listRooms({ guests: optionalNumber(c.req.query("guests")) })))
    .get("/availability", (c) => {
        const { checkIn = "", checkOut = "", guests = "1" } = c.req.query();
        return c.json(searchRooms({ checkIn, checkOut, guests: Number(guests) }));
    })
    // When the rooms are booked, for the calendar of the website; without the guests' names
    .get("/occupancy", (c) => {
        const { from = "", to = "" } = c.req.query();
        return c.json(listOccupancy({ from, to }));
    })
    .get("/bookings", (c) => c.json(listBookings(c.req.query("guestName") ?? "")))
    .post("/bookings", async (c) => {
        const { roomId, guestName, guests, checkIn, checkOut } = await c.req.json<Record<string, unknown>>();
        const booking = createBooking({
            roomId: String(roomId),
            guestName: String(guestName ?? ""),
            guests: Number(guests),
            checkIn: String(checkIn),
            checkOut: String(checkOut),
        });
        return c.json(booking, 201);
    })
    // The name on the booking must match, as the guest isn't logged in
    .delete("/bookings/:id{[0-9]+}", (c) => c.json(cancelBooking(Number(c.req.param("id")), c.req.query("guestName") ?? "")));

const app = new Hono()
    .route("/api/hotel", hotel)
    .get("/room-images/:file{[0-9]+\\.jpg}", (c) => {
        const image = readRoomImage(c.req.param("file").replace(/\.jpg$/, ""));
        if (!image) {
            return c.notFound();
        }
        return c.body(new Uint8Array(image), 200, { "Content-Type": "image/jpeg", "Cache-Control": "max-age=3600" });
    })
    // Errors of the booking logic, e.g. a room that is already booked
    .onError((error, c) => c.json({ error: error.message }, 400));

serve({ fetch: app.fetch, port }, () => {
    console.log(`Hotel API listening on ${serverUrl}/api/hotel`);
});
