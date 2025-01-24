import React from "react"

import {
  UNSTABLE_Tree as Tree,
  UNSTABLE_TreeItem as TreeItem,
  UNSTABLE_TreeItemContent as TreeItemContent,
  Button
} from "react-aria-components"

import { ArrowRight, File, Folder } from "../../icons"

import "./index.scss"

const items = [
  {
    id: 1,
    title: "Client",
    children: [
      { id: 2, title: "Project", children: [{ id: 3, title: "Report", children: [] }] },
      {
        id: 4,
        title: "Project",
        children: [
          { id: 5, title: "Report", children: [] },
          { id: 6, title: "Report", children: [] }
        ]
      }
    ]
  }
]

const MenuStructure: React.FC = () => {
  return (
    <div className="Menu-Structure">
      <Tree aria-label="Files" selectionMode="multiple" items={items}>
        {function renderItem(item) {
          return (
            <TreeItem textValue={item.title}>
              <TreeItemContent>
                <a href="#">
                  {item.children.length ? (
                    <Button slot="chevron">
                      <ArrowRight />
                    </Button>
                  ) : null}
                  {item.title === "Client" ? (
                    <div className="logo">
                      <img src="images/mercury_logo.png" alt="" />
                    </div>
                  ) : item.title === "Project" ? (
                    <Folder />
                  ) : (
                    <File />
                  )}
                  <span>{item.title}</span>
                </a>
              </TreeItemContent>
              {item.children.map((item, i) => {
                return (
                  <React.Fragment key={`${item.title}_${i}_child`}>
                    {(item.title === "Project" || item.title === "Report") && i === 0 && (
                      <TreeItem textValue={item.title}>
                        <TreeItemContent>
                          <a href="#">
                            <span>{`+ Add new ${item.title.toLowerCase()}`}</span>
                          </a>
                        </TreeItemContent>
                      </TreeItem>
                    )}

                    {renderItem(item)}
                  </React.Fragment>
                )
              })}
            </TreeItem>
          )
        }}
      </Tree>
      <Button className="New-Client">
        <a href="#">+ Create New Client</a>
      </Button>
    </div>
  )
}

export default MenuStructure
