import {useDocument} from "automerge-repo-solid-primitives"
import type {AutomergeUrl} from "@automerge/automerge-repo"
import repo from "../../repo/repo.ts"
import {createSignal, For, Match, onMount, Switch} from "solid-js"

import "./app.css"

const projectURL = "automerge:4RToGEHejfbXoncNPfVU74AHrb3Y" as AutomergeUrl
type Item = {title: string; complete?: Date | null}
type Project = {title: string; items: Item[]}

function App() {
	const [project, handle] = useDocument<Project>(projectURL, {repo})
	const [editing, setEditing] = createSignal<number>()

	return (
		<main>
			<h1>{project()?.title} </h1>

			<div>
				<button
					onclick={() => {
						handle()?.change(project => {
							project.items.unshift({
								title: "new item",
								complete: null,
							})
						})
					}}>
					add
				</button>
			</div>

			<ul>
				<For each={project()?.items}>
					{(item, index) => (
						<li>
							<input
								type="checkbox"
								checked={!!item.complete}
								onchange={event => {
									event.preventDefault()
									handle()?.change(project => {
										const item = project.items[index()]
										const c = item.complete
										item.complete = c ? null : new Date()
									})
								}}
							/>

							<Switch>
								<Match when={editing() != index()}>
									<span
										onclick={() => {
											setEditing(index())
										}}>
										{item.title}
									</span>
								</Match>

								<Match when={editing() == index()}>
									<form
										onsubmit={event => {
											event.preventDefault()
											setEditing(undefined)
										}}>
										<input
											autofocus
											ref={n => {
												onMount(() => {
													n?.focus()
												})
											}}
											type="text"
											value={item.title}
											// onblur={() => {
											// 	setEditing(undefined)
											// }}
											onkeyup={event => {
												if (event.key === "Escape") {
													setEditing(undefined)
												}
											}}
											oninput={event => {
												event.preventDefault()
												handle()?.change(project => {
													project.items[index()].title =
														event.currentTarget.value
												})
											}}
										/>
										<button type="submit">save</button>
									</form>
								</Match>
							</Switch>
						</li>
					)}
				</For>
			</ul>
		</main>
	)
}

export default App
