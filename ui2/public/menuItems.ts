export default [
  {
    id: 1,
    type: "clients",
    name: "New Client 1",
    reference: "0",
    children: [
      {
        id: 2,
        type: "projects",
        name: "project1",
        reference: "0000",
        children: [{ id: 3, type: "reports", name: "report1", reference: "001", children: [] }]
      },
      {
        id: 4,
        type: "projects",
        name: "project2",
        reference: "0001",
        children: [
          { id: 5, type: "reports", name: "report2", reference: "002", children: [] },
          { id: 6, type: "reports", name: "report3", reference: "003", children: [] }
        ]
      }
    ]
  },
  {
    id: 7,
    type: "clients",
    name: "New Client 2",
    reference: "1",
    children: [
      {
        id: 8,
        type: "projects",
        name: "project3",
        reference: "1110",
        children: [{ id: 9, type: "reports", name: "report4", reference: "111", children: [] }]
      },
      {
        id: 10,
        type: "projects",
        name: "project4",
        reference: "1111",
        children: [
          { id: 11, type: "reports", name: "report5", reference: "112", children: [] },
          { id: 12, type: "reports", name: "report6", reference: "113", children: [] }
        ]
      }
    ]
  }
]
