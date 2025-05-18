import { JSX } from "react";
import HomePage from "../../pages/homePage/homePage";
import ShifrPage from "../../pages/cipherPage/cipherPage";

interface Iroutes {
	path: string;
	Component: () => JSX.Element;
}

export const routes: Iroutes[] = [
	{
		path: '/',
		Component: HomePage,
	},
	{
		path: '/cipher/:name',
		Component: ShifrPage,
	}
]
