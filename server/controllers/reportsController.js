const PDFDocument = require('pdfkit');
const pool = require('../config/db');

// Helper to format date
const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
});

exports.getMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and Year are required' });
        }

        const m = parseInt(month);
        const y = parseInt(year);

        const query = `
            SELECT c.*, u.name as student_name, s.name as staff_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users s ON c.assigned_to = s.id
            WHERE EXTRACT(MONTH FROM c.created_at) = $1 
            AND EXTRACT(YEAR FROM c.created_at) = $2
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query, [m, y]);
        const complaints = result.rows;

        // Calculate Summary
        const summary = {
            total: complaints.length,
            dispatched: complaints.filter(c => c.status === 'DISPATCHED').length,
            in_progress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
            completed: complaints.filter(c => c.status === 'COMPLETED').length,
            categories: {}
        };

        complaints.forEach(c => {
            summary.categories[c.category] = (summary.categories[c.category] || 0) + 1;
        });

        // Initialize PDF
        const doc = new PDFDocument({ margin: 50 });
        const filename = `Hostel_Report_${m}_${y}.pdf`;

        // Set response headers
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Header
        doc.fontSize(20).text('Hostel Complaint Management System', { align: 'center' });
        doc.fontSize(16).text('Monthly Performance Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Report Period: ${new Date(y, m-1).toLocaleString('default', { month: 'long' })} ${y}`, { align: 'center' });
        doc.text(`Generated on: ${formatDate(new Date())}`, { align: 'center' });
        doc.moveDown();
        doc.rect(50, doc.y, 500, 2).fill('#3b82f6');
        doc.moveDown(2);

        // Summary Section
        doc.fontSize(14).fillColor('#1f2937').text('Executive Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#374151');
        doc.text(`Total Complaints Received: ${summary.total}`);
        doc.text(`Successfully Completed: ${summary.completed}`);
        doc.text(`Currently In Progress: ${summary.in_progress}`);
        doc.text(`Awaiting Dispatch: ${summary.dispatched}`);
        doc.moveDown();

        // Category Breakdown
        doc.fontSize(14).fillColor('#1f2937').text('Category Breakdown', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#4b5563');
        Object.entries(summary.categories).forEach(([name, count]) => {
            doc.text(`${name}: ${count} tickets`);
        });
        doc.moveDown(2);

        // Complaints Table
        doc.fontSize(14).fillColor('#1f2937').text('Detailed Complaint Log', { underline: true });
        doc.moveDown(0.5);

        if (complaints.length === 0) {
            doc.fontSize(10).text('No complaints recorded for this period.');
        } else {
            // Draw Table Header
            const startX = 50;
            let currentY = doc.y;
            doc.fontSize(10).fillColor('#ffffff').rect(startX, currentY, 500, 20).fill('#4b5563');
            doc.fillColor('#ffffff').text('ID', startX + 5, currentY + 5);
            doc.text('Category', startX + 40, currentY + 5);
            doc.text('Student', startX + 130, currentY + 5);
            doc.text('Status', startX + 230, currentY + 5);
            doc.text('Priority', startX + 310, currentY + 5);
            doc.text('Created At', startX + 380, currentY + 5);
            
            currentY += 25;
            doc.fillColor('#000000');

            // Draw Rows
            complaints.forEach((c, index) => {
                // Page break check
                if (currentY > 650) {
                    doc.addPage();
                    currentY = 50;
                }

                // Zebra striping
                if (index % 2 === 0) {
                    doc.rect(startX, currentY - 5, 500, 20).fill('#f9fafb');
                }

                doc.fillColor('#374151');
                doc.text(c.id.toString(), startX + 5, currentY);
                doc.text(c.category, startX + 40, currentY);
                doc.text(c.student_name || 'N/A', startX + 130, currentY, { width: 90, ellipsis: true });
                doc.text(c.status, startX + 230, currentY);
                doc.text(c.priority, startX + 310, currentY);
                doc.text(formatDate(c.created_at).split(',')[0], startX + 380, currentY);

                currentY += 20;
            });
        }

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#9ca3af').text(
                `Page ${i + 1} of ${pageCount} - Hostel Care Official Report`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );
        }

        doc.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error generating report' });
    }
};

exports.exportAllCSV = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.category, c.description, c.priority, c.status, c.room_number,
                   c.created_at, u.name as student_name, s.name as staff_name
            FROM complaints c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN users s ON c.assigned_to = s.id
            ORDER BY c.created_at DESC
        `;
        const result = await pool.query(query);
        const complaints = result.rows;

        const filename = `Hostel_Complaints_Export_${Date.now()}.csv`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.set('Content-Type', 'text/csv');

        // CSV Header
        const header = ['ID', 'Date', 'Category', 'Description', 'Priority', 'Status', 'Room', 'Student', 'Staff'];
        let csvContent = header.join(',') + '\n';

        // CSV Rows (escaping quotes for safety)
        complaints.forEach(c => {
            const row = [
                c.id,
                formatDate(c.created_at),
                `"${c.category}"`,
                `"${c.description.replace(/"/g, '""')}"`,
                c.priority,
                c.status,
                c.room_number || 'N/A',
                `"${c.student_name || 'N/A'}"`,
                `"${c.staff_name || 'N/A'}"`
            ];
            csvContent += row.join(',') + '\n';
        });

        res.status(200).send(csvContent);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error exporting CSV' });
    }
};
