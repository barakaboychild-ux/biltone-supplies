# How to Run Biltone Supplies

Since you don't have Python or Node.js installed, the easiest way to run the site is by opening the files directly in your browser.

1.  **Open the Admin Login:**
    Double-click on `admin/login.html`.
    Or open this path: `c:\Users\barak\OneDrive\Desktop\biltone Supplies\admin\login.html`

2.  **Open the Storefront:**
    Double-click on `index.html`.

## Troubleshooting Registration
If clicking "Register" does nothing or doesn't show "Success":
1.  Press `F12` (or right-click > Inspect).
2.  Go to the **Console** tab.
3.  Try registering again and look for red error messages.
4.  Common issues:
    -   **CORS Error**: Access to Supabase blocked from `file://`.
    -   **Invalid Key**: The Supabase key in `js/config.js` might be expired or invalid.
