import type {JSX} from "solid-js"
import {ToastRegion} from "../components/toast.tsx"
import ServiceWorker from "../components/service-worker.tsx"

export default function Chrome(props: {children: JSX.Element}) {
	return (
		<div class="chrome">
			{props.children}
			<ToastRegion />
			<ServiceWorker />
		</div>
	)
}
