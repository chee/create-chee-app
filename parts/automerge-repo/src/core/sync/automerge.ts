/* @refresh reload */

import {
	Repo,
	IndexedDBStorageAdapter,
	WebSocketClientAdapter,
} from "@automerge/vanillajs"

export default new Repo({
	storage: new IndexedDBStorageAdapter(),
	network: [new WebSocketClientAdapter("wss://galaxy.observer")],
	enableRemoteHeadsGossiping: true,
})
