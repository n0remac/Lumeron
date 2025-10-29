import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import CartButton from "./CartButton";

export default async function Navbar() {
  const isAdmin = await isAuthenticated();

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          Lumeron
        </Link>
      </div>
      <div className="flex-none gap-2">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/">Shop</Link>
          </li>
          {isAdmin && (
            <li>
              <Link href="/admin">Admin</Link>
            </li>
          )}
        </ul>
        <CartButton />
      </div>
    </div>
  );
}
