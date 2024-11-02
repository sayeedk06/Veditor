import { Link } from "react-router-dom";

export default function Root() {
    return (
        <div>
            <ul className="Navbar">
                <li><Link>Logo</Link></li>
                <li><Link>Home</Link></li>
                <li><Link>About</Link></li>
            </ul>
        </div>
    )
}