export default [
  {
    id: 1,
    type: "Client",
    title: "New Client 1",
    reference: null,
    children: [
      {
        id: 2,
        type: "Project",
        title: "Test",
        reference: "0000",
        children: [{ id: 3, type: "Report", title: "Test Results", reference: null, children: [] }]
      },
      {
        id: 4,
        type: "Project",
        title: "Test",
        reference: "0000",
        children: [
          { id: 5, type: "Report", title: "Test Results", reference: null, children: [] },
          { id: 6, type: "Report", title: "Test Results", reference: null, children: [] }
        ]
      }
    ]
  },
  {
    id: 7,
    type: "Client",
    title: "New Client 2",
    reference: null,
    children: [
      {
        id: 8,
        type: "Project",
        title: "Test",
        reference: "1111",
        children: [{ id: 9, type: "Report", title: "Test Results", reference: null, children: [] }]
      },
      {
        id: 10,
        type: "Project",
        title: "Test",
        reference: "1111",
        children: [
          { id: 11, type: "Report", title: "Test Results", reference: null, children: [] },
          { id: 12, type: "Report", title: "Test Results", reference: null, children: [] }
        ]
      }
    ]
  }
]
