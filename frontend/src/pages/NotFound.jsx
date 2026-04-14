/**
 * @page NotFound
 * @route /not-found
 * @description Thin page component. Owns routing params and orchestrates
 * the not found feature — no business logic lives here.
 *
 * Page components follow a strict rule: they may use hooks and compose
 * feature components, but contain zero rendering logic of their own.
 * If you find yourself writing JSX beyond a layout wrapper here,
 * it belongs in a feature component instead.
 */
export default function NotFound() {
    return (
        <div>
            <h1>404 - Not Found</h1>
        </div>
    )
}