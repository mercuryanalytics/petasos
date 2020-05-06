# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)



client = Client.first
client2 = Client.last

project = Project.create!(client: client, name: 'Client 1 project 1')
c1_p1_r1 = Report.create!(project: project, name: 'Client 1 project 1 report 1')
c1_p1_r2 = Report.create!(project: project, name: 'Client 1 project 1 report 2')
c1_p1_r3 = Report.create!(project: project, name: 'Client 1 project 1 report 3')


c1_p2 = Project.create!(client: client, name: 'Client 1 project 2')
c1_p2_r1 = Report.create!(project: c1_p2, name: 'Client 1 project 2 report 1')
c1_p2_r2 = Report.create!(project: c1_p2, name: 'Client 1 project 2 report 2')
c1_p2_r3 = Report.create!(project: c1_p2, name: 'Client 1 project 2 report 3')


client_2 = Client.last
c2_p1 = Project.create!(client: client_2, name: 'Client 2 project 1')
c2_p1_r1 = Report.create!(project: c2_p1, name: 'Client 2 project 2 report 1')
c2_p1_r2 = Report.create!(project: c2_p1, name: 'Client 2 project 2 report 2')
c2_p1_r3 = Report.create!(project: c2_p1, name: 'Client 2 project 2 report 3')

c2_p2 = Project.create!(client: client_2, name: 'Client 2 project 2')
c2_p2_r1 = Report.create!(project: c2_p2, name: 'Client 2 project 2 report 1')
c2_p2_r2 = Report.create!(project: c2_p2, name: 'Client 2 project 2 report 2')
c2_p2_r3 = Report.create!(project: c2_p2, name: 'Client 2 project 2 report 3')

user = User.first

Authorization.create!(user: user, subject_class: 'Report', subject_id: c2_p2_r1.id)
Authorization.create!(user: user, subject_class: 'Project', subject_id: c2_p1.id)
Authorization.create!(user: user, subject_class: 'Project', subject_id: c1_p2.id)
