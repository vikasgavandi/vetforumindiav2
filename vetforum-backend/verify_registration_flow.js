const { User, Expert } = require('./src/models');
const { register } = require('./src/controllers/authController');
const { approveUser } = require('./src/controllers/adminController');

const verifyFlow = async () => {
    try {
        console.log('--- Verification Start ---');

        // 1. Simulate Veterinarian Registration
        const vetEmail = `vet_verify_${Date.now()}@test.com`;
        const vetData = {
            firstName: 'Verify',
            lastName: 'Vet',
            email: vetEmail,
            mobile: '1234567890',
            state: 'Maharashtra',
            password: 'password123',
            isVeterinarian: true,
            veterinarianType: 'Graduated',
            vetRegNo: 'VET123',
            qualification: 'BVSc',
            veterinarianState: 'Maharashtra'
        };

        // Mock req/res
        const mockRes = {
            status: function(s) { this.statusCode = s; return this; },
            json: function(j) { this.body = j; return this; }
        };

        console.log(`Registering Vet: ${vetEmail}`);
        await register({ body: vetData, files: {} }, mockRes);
        
        const registeredVet = await User.findOne({ where: { email: vetEmail } });
        console.log(`Vet Status: ${registeredVet.approvalStatus} (Expected: pending)`);

        // 2. Simulate Regular User Registration
        const userEmail = `user_verify_${Date.now()}@test.com`;
        const userData = {
            firstName: 'Verify',
            lastName: 'User',
            email: userEmail,
            mobile: '0987654321',
            state: 'Maharashtra',
            password: 'password123',
            isVeterinarian: false
        };

        console.log(`Registering User: ${userEmail}`);
        await register({ body: userData, files: {} }, mockRes);

        const registeredUser = await User.findOne({ where: { email: userEmail } });
        console.log(`User Status: ${registeredUser.approvalStatus} (Expected: approved)`);

        // 3. Approve Veterinarian as Admin
        console.log(`Approving Vet (ID: ${registeredVet.id})`);
        const adminUser = await User.findOne({ where: { isAdmin: true } });
        await approveUser({ 
            params: { id: registeredVet.id },
            user: adminUser 
        }, mockRes);

        const approvedVet = await User.findByPk(registeredVet.id);
        const expertProfile = await Expert.findOne({ where: { userId: registeredVet.id } });
        
        console.log(`Approved Vet Status: ${approvedVet.approvalStatus} (Expected: approved)`);
        console.log(`Expert Profile Created: ${!!expertProfile} (Expected: true)`);
        if (expertProfile) {
            console.log(`Expert Name: ${expertProfile.name}`);
        }

        console.log('--- Verification Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyFlow();
