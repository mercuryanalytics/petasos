import React from "react"
import { useAtomValue } from "jotai"
import { Breadcrumb as RACBreadcrumb, Breadcrumbs, BreadcrumbProps, LinkProps, Link } from "react-aria-components"

import { breadcrumbs as crumbs } from "../../../atoms"

import { BreadcrumbsArrow } from "../../icons"

import "./index.scss"

type Props = BreadcrumbProps & Omit<LinkProps, "className">

const Title: React.FC<Props> = ({ ...props }) => {
  const breadcrumbs = useAtomValue(crumbs)

  return (
    <Breadcrumbs>
      {breadcrumbs?.map(({ name }) => (
        <RACBreadcrumb {...props} key={name}>
          {({ isCurrent }) => (
            <>
              {name}
              <Link {...props} />
              {!isCurrent && <BreadcrumbsArrow />}
            </>
          )}
        </RACBreadcrumb>
      ))}
    </Breadcrumbs>
  )
}
export default Title
