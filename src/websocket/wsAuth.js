//websocket//wsAuth.js(ticket validation logic)
import { verifyTicket } from "../services/ticket.service.js";

export const authenticateWebSocket = async (req) => {
  try {
    const url = new URL(req.url, "ws://base"); //why like this?1.
    const ticket = url.searchParams.get("ticket");
    if (!ticket) {
      return { success: false, reason: "No Ticket Provied" };//why didnt write the res.status(status code).json({}); ans:Not Express.
    }

    const userId = await verifyTicket(ticket);
    if (!userId) {
      return { success: false, reason: "Invalid or expired ticket" };
    }

    return {
      success: true,
      user: { id: userId },
    };
  } catch (error) {
     console.error("WS auth error:", error);
    return { success: false, reason: "Auth Error" }; //diff btn msg or reason ?2
  }
};

/* 

1.const url = new URL(req.url,"ws://base");//why like this?
ans:
request.url only gives: /ws?ticket=abc123
👉 It’s a relative URL, not a full one.
⚠️ Problem
The URL constructor requires a full URL, like:
ws://yourdomain.com/ws?ticket=abc123

✅ Solution
So we do this:
const url = new URL(request.url, 'ws://base');

👉 It combines:
request.url → /ws?ticket=abc123
'ws://base' → fake base
Final result becomes:
ws://base/ws?ticket=abc123
Now Node can parse it properly.

------------------------------------------------------------------
2.return {success:false,reason:"Auth Error"};//diff btn msg or reason ? what if i write msg instead of reason? 2
ans:
Not technical difference at all
Both are just object keys. msg is send to the user, but reason is internal matter which is not sending to the client so reason make more sence.


*/


