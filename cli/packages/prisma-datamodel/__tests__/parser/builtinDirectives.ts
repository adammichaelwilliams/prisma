import RelationalParser from '../../src/datamodel/parser/relationalParser'
import DocumentParser from '../../src/datamodel/parser/documentParser'
import { IGQLType } from '../../src/datamodel/model'
import { SdlExpect } from '../../src/test-helpers' 

const parsersToTest = [{ name: 'relational', instance: new RelationalParser()}, { name: 'document', instance: new DocumentParser()}]

for(const parser of parsersToTest) {
  describe(`${parser.name} parser directive tests`, () => {
    test('Parse a type with directives correctly.', () => {
      const model = `
        type User @db(name: "user") {
          id: Int! @id
          createdAt: DateTime! @createdAt
          updatedAt: DateTime! @updatedAt
          mappedField: String! @db(name: "dbField") @relation(name: "typeRelation")
        }
      `

      const { types } = parser.instance.parseFromSchemaString(model)

      const userType = SdlExpect.type(types, 'User')
      expect(userType.databaseName).toBe('user')

      const idField = SdlExpect.field(userType, 'id', true, false, 'Int', true, true)
      expect(idField.isId).toBe(true)
      const createdAtField = SdlExpect.field(userType, 'createdAt', true, false, 'DateTime', false, true)
      expect(createdAtField.isCreatedAt).toBe(true)
      const updatedAtField = SdlExpect.field(userType, 'updatedAt', true, false, 'DateTime', false, true)
      expect(updatedAtField.isUpdatedAt).toBe(true)
      const mappedField = SdlExpect.field(userType, 'mappedField', true, false, 'String', false, false)
      expect(mappedField.databaseName).toBe('dbField')
      expect(mappedField.relationName).toBe('typeRelation')
    })
  })
}