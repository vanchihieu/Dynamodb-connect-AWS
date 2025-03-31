const { dynamodb } = require("./aws.helper");
const tableName = "MonHoc4";

const MonHocModel = {
  createMonHoc: async (monhoc) => {
    const params = {
      TableName: tableName,
      Item: {
        id: monhoc.id,
        name: monhoc.name,
        type: monhoc.type,
        semester: monhoc.semester,
        department: monhoc.department,
        image: monhoc.image,
      },
    };

    try {
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.log("Error createMonHoc", error);
      throw error;
    }
  },

  getAllMonHoc: async () => {
    const params = {
      TableName: tableName,
    };

    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items;
    } catch (error) {
      console.log("Error getAllMonHoc", error);
      throw error;
    }
  },

  getMonHocById: async (id) => {
    const params = {
      TableName: tableName,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: {
        ":id": id,
      },
    };

    try {
      const data = await dynamodb.query(params).promise();
      console.log("🚀 ~ getMonHocById: ~ data:", data);

      return data.Items[0];
    } catch (error) {
      console.log("Error getMonHocById", error);
      throw error;
    }
  },

  updateMonHoc: async (monhoc) => {
    const params = {
      TableName: tableName,
      Key: {
        id: monhoc.id,
        // name: monhoc.name,
      },
      UpdateExpression:
        "set #name = :name, #type = :type, #semester = :semester, #department = :department, #image = :image",
      ExpressionAttributeNames: {
        "#name": "name",
        "#type": "type",
        "#semester": "semester",
        "#department": "department",
        "#image": "image",
      },
      ExpressionAttributeValues: {
        ":name": monhoc.name,
        ":type": monhoc.type,
        ":semester": monhoc.semester,
        ":department": monhoc.department,
        ":image": monhoc.image,
      },
      ReturnValues: "UPDATED_NEW",
    };

    try {
      const data = await dynamodb.update(params).promise();
      return data.Attributes;
    } catch (error) {
      console.log("Error updateMonHoc", error);
      throw error;
    }
  },

  deleteMonHoc: async (id) => {
    const params = {
      TableName: tableName,
      Key: {
        id, // id la partition key
        // name: tenMonHoc, // tenMonHoc la sort key
      },
    };

    console.log("params", params);

    try {
      await dynamodb.delete(params).promise();
      return { id };
    } catch (error) {
      console.log("Error deleteMonHoc", error);
      throw error;
    }
  },
};

module.exports = MonHocModel; // export object MonHocModel để sử dụng ở các file khác
