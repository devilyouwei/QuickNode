const { DataTypes } = require('sequelize')

// example for table model

module.exports = {
    Contract: {
        name: 'contract',
        table: {
            Id: { type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true },
            TxHash: DataTypes.STRING,
            Network: DataTypes.STRING,
            ContractAddress: { type: DataTypes.STRING, unique: true },
            SourceCode: DataTypes.TEXT('medium'),
            ABI: DataTypes.TEXT,
            ContractName: DataTypes.STRING,
            CompilerVersion: DataTypes.STRING,
            OptimizationUsed: DataTypes.BOOLEAN,
            Runs: DataTypes.INTEGER(11),
            ConstructorArguments: DataTypes.TEXT,
            EVMVersion: DataTypes.STRING,
            Library: DataTypes.TEXT,
            LicenseType: DataTypes.STRING,
            Proxy: DataTypes.STRING,
            Implementation: DataTypes.STRING,
            SwarmSource: DataTypes.STRING,
            Creator: DataTypes.STRING,
            ContractType: DataTypes.STRING,
            Embedding: DataTypes.TEXT('long')
        },
        options: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
            indexes: [
                {
                    name: 'contract_network_index',
                    method: 'BTREE',
                    fields: ['Network']
                }
            ]
        }
    }
}
