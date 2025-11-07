export default [
  {
    id: 1,
    type: "Client",
    title: "New Client 1",
    children: [
      {
        id: 2,
        type: "Project",
        title: "0000: Test",
        children: [{ id: 3, type: "Report", title: "Test Results", children: [] }]
      },
      {
        id: 4,
        type: "Project",
        title: "0000: Test",
        children: [
          { id: 5, type: "Report", title: "Test Results", children: [] },
          { id: 6, type: "Report", title: "Test Results", children: [] }
        ]
      }
    ]
  },
  {
    id: 7,
    type: "Client",
    title: "New Client 2",
    children: [
      {
        id: 8,
        type: "Project",
        title: "1111: Test",
        children: [{ id: 9, type: "Report", title: "Test Results", children: [] }]
      },
      {
        id: 10,
        type: "Project",
        title: "1111: Test",
        children: [
          { id: 11, type: "Report", title: "Test Results", children: [] },
          { id: 12, type: "Report", title: "Test Results", children: [] }
        ]
      }
    ]
  }
]
