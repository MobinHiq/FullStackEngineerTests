import { ConfigurationList } from "./components/ConfigurationList";
import { ConfigurationCreate } from "./components/ConfigurationCreate";
import { ConfigurationEdit } from "./components/ConfigurationEdit";

export const AppRoutes = [
  {
    path: "/configurations",
    element: <ConfigurationList />,
  },
  {
    path: "/edit/:id",
    element: <ConfigurationEdit />,
  },
  {
    path: "/create",
    element: <ConfigurationCreate />,
  },
];

export default AppRoutes;
