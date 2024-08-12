import appAndPages from './app-and-pages'
import user from './user'
import dashboard from './dashboard'
import uiElements from './ui-elements'
import type { VerticalNavItems } from '@/@layouts/types'

export default [...dashboard, ...appAndPages, ...user, ...uiElements] as VerticalNavItems

// export default [...dashboard, ...appAndPages, ...uiElements, ...forms, ...charts, ...others] as VerticalNavItems
