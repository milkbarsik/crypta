import { Navigate, Route, Routes } from "react-router-dom"
import { routes } from "./routes"

const Approuter = () => {
	return (
		<Routes>
			{
				routes.map(({path, Component}) => (
					<Route key={path} path={path} element={<Component/>} />
				))
			}
			<Route path="*" element={<Navigate to={'/'} />} />
		</Routes>
	)
}

export default Approuter;