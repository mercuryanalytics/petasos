export default [
  {
    id: 1,
    type: "clients",
    title: "New Client 1",
    reference: "0",
    children: [
      {
        id: 2,
        type: "projects",
        title: "Test",
        reference: "0000",
        children: [{ id: 3, type: "reports", title: "Test Results", reference: "001", children: [] }]
      },
      {
        id: 4,
        type: "projects",
        title: "Test",
        reference: "0000",
        children: [
          { id: 5, type: "reports", title: "Test Results", reference: "001", children: [] },
          { id: 6, type: "reports", title: "Test Results", reference: "001", children: [] }
        ]
      }
    ]
  },
  {
    id: 7,
    type: "clients",
    title: "New Client 2",
    reference: "1",
    children: [
      {
        id: 8,
        type: "projects",
        title: "Test",
        reference: "1111",
        children: [{ id: 9, type: "reports", title: "Test Results", reference: "111", children: [] }]
      },
      {
        id: 10,
        type: "projects",
        title: "Test",
        reference: "1111",
        children: [
          { id: 11, type: "reports", title: "Test Results", reference: "111", children: [] },
          { id: 12, type: "reports", title: "Test Results", reference: "111", children: [] }
        ]
      }
    ]
  }
]
