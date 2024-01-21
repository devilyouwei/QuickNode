const { DataTypes } = require('sequelize')

// example for table model

module.exports = {
    CTMasterChild: {
        name: 'CTMasterChild',
        table: {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                comment: '自增id'
            },
            unique: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '唯一值  就是数据的md5'
            },
            master_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
                comment: '主表信息'
            },
            position_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
                comment: '主表信息'
            },
            file_path: {
                type: DataTypes.STRING(500),
                allowNull: false,
                defaultValue: '',
                comment: '原资源地址'
            },
            oss_url: {
                type: DataTypes.STRING(200),
                allowNull: false,
                defaultValue: '',
                comment: 'oss地址'
            },
            text: {
                type: DataTypes.TEXT,
                comment: '解析内容'
            }
        },
        options: {
            tableName: 'ct_master_child',
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ['unique']
                },
                {
                    fields: ['master_id']
                },
                {
                    fields: ['position_id']
                }
            ]
        }
    }
}
