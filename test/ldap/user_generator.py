from names_generator import generate_name

doc = """
# Root creation
dn: dc=example,dc=org
objectClass: dcObject
objectClass: organization
dc: example
o: example

dn: ou=users,dc=example,dc=org
objectClass: organizationalUnit
ou: users


"""

groups = """
# Group creation
dn: cn=admins,ou=users,dc=example,dc=org
cn: admins
objectClass: groupOfNames
member: cn=user1,ou=users,dc=example,dc=org
member: cn=user2,ou=users,dc=example,dc=org
member: cn=user3,ou=users,dc=example,dc=org
member: cn=user4,ou=users,dc=example,dc=org


dn: cn=readers,ou=users,dc=example,dc=org
cn: readers
objectClass: groupOfNames
"""

for x in range(1,100):
    name = generate_name(style='capital').split()
    doc += f"""

# User user{x} creation
dn: cn=user{x},ou=users,dc=example,dc=org
cn: User{x}
sn: {name[0].lower()}.{name[1].lower()}@example.org
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: shadowAccount
userPassword: password
uid: user{x}
uidNumber: {x}
gidNumber: {x}
homeDirectory: /home/user{x}
givenName: {name[0]}
displayName: {name[1]}

"""

    groups += f"member: cn=user{x},ou=users,dc=example,dc=org\n"

doc += groups

with open("config.ldif", "w", encoding="utf8") as file:
    file.write(doc)