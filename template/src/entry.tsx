/* @refresh reload */
import {lazy} from "solid-js"
import {render} from "solid-js/web"
import {Router, Route} from "@solidjs/router"
import Chrome from "./layouts/chrome.tsx"

render(
	() => (
		<Router root={Chrome}>
			<Route path="/" component={lazy(() => import("./pages/home.tsx"))} />
		</Router>
	),
	document.getElementById("app")!
)
