import { encrypt } from "./ccavutil.js";

export function postReq(request, response) {
  const workingKey = "50395EED2B7EF1F92FD32E1AEACF4412"; // Ensure this is exactly 32 characters long
  const accessCode = "AVAO17LI68AN65OANA"; // Put in the Access Code shared by CCAvenues.

  request.on("data", function (data) {
    const body = JSON.parse(data);
    const encRequest = encrypt(JSON.stringify(body), workingKey);
    const formbody = `
            <form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
                <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}">
                <input type="hidden" name="access_code" id="access_code" value="${accessCode}">
                <script language="javascript">document.redirect.submit();</script>
            </form>`;

    response.writeHead(200, { "Content-Type": "text/html" });
    response.write(formbody);
    response.end();
  });
}
