<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Welcome Email',
                'slug' => 'welcome-email',
                'subject' => 'Welcome to Our Platform - {name}!',
                'body' => '<h2>Welcome to Our Platform!</h2>
                            <p>Hello {name},</p>
                            <p>Thank you for joining our community. We\'re excited to have you on board!</p>
                            <h3>Getting Started</h3>
                            <p>To get started, please verify your email address by clicking the link below:</p>
                            <p><a href="{verify_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a></p>
                            <p>If you have any questions, feel free to contact our support team at <strong>support@example.com</strong></p>
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'Sent when a new user creates an account',
                'status' => 1,
            ],
            [
                'name' => 'Email Verification',
                'slug' => 'email-verification',
                'subject' => 'Verify Your Email Address - {verification_code}',
                'body' => '<h2>Email Verification Required</h2>
                            <p>Hello {name},</p>
                            <p>Please verify your email address using the verification code below:</p>
                            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 4px; text-align: center; margin: 20px 0;">
                                <h3 style="margin: 0; font-family: monospace; letter-spacing: 5px; color: #007bff;">{verification_code}</h3>
                            </div>
                            <p>This code will expire in 24 hours.</p>
                            <p>If you did not request this verification, please ignore this email.</p>
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'Sent when user requests email verification',
                'status' => 1,
            ],
            [
                'name' => 'Password Reset',
                'slug' => 'password-reset',
                'subject' => 'Password Reset Request - {app_name}',
                'body' => '<h2>Password Reset Request</h2>
                            <p>Hello {name},</p>
                            <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
                            <p>To reset your password, click the link below:</p>
                            <p><a href="{reset_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
                            <p><strong>This link will expire in 1 hour.</strong></p>
                            <p>For security reasons, never share your password with anyone.</p>
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'Sent when user requests password reset',
                'status' => 1,
            ],
            [
                'name' => 'Account Activated',
                'slug' => 'account-activated',
                'subject' => 'Your Account Has Been Activated - Welcome!',
                'body' => '<h2>Account Activation Confirmed</h2>
                            <p>Hello {name},</p>
                            <p>Great news! Your account has been successfully activated.</p>
                            <p>You can now log in to your account using your email and password.</p>
                            <p><a href="{login_url}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Log In to Your Account</a></p>
                            <p><strong>Account Details:</strong></p>
                            <ul>
                                <li>Email: {email}</li>
                                <li>Username: {username}</li>
                            </ul>
                            <p>If you have any questions or need assistance, please contact our support team.</p>
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'Sent when admin activates a user account',
                'status' => 1,
            ],
            [
                'name' => 'Password Changed',
                'slug' => 'password-changed',
                'subject' => 'Your Password Has Been Changed Successfully',
                'body' => '<h2>Password Change Confirmation</h2>
                            <p>Hello {name},</p>
                            <p>This is to confirm that your password has been successfully changed.</p>
                            <p>If you did not make this change or suspect unauthorized access to your account, please <a href="{support_url}">contact our support team</a> immediately.</p>
                            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Security Tip:</strong> Never share your password with anyone. Our team will never ask for your password.</p>
                            </div>
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'Sent when user changes their password',
                'status' => 1,
            ],
            [
                'name' => 'Contact Form Reply',
                'slug' => 'contact-form-reply',
                'subject' => 'We Received Your Message - {ticket_number}',
                'body' => '<h2>Thank You for Contacting Us</h2>
                            <p>Hello {name},</p>
                            <p>We have received your message and will get back to you as soon as possible.</p>
                            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <p style="margin: 0;"><strong>Ticket Number:</strong> {ticket_number}</p>
                                <p style="margin: 10px 0 0 0;"><strong>Subject:</strong> {subject}</p>
                            </div>
                            <p>Your message has been recorded in our support system. You can track the status using your ticket number above.</p>
                            <p>Expected response time: 24-48 hours</p>
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'Sent as automatic reply to contact form submissions',
                'status' => 1,
            ],
            [
                'name' => 'General Notification',
                'slug' => 'general-notification',
                'subject' => '{notification_title}',
                'body' => '<h2>{notification_title}</h2>
                            <p>Hello {name},</p>
                            <p>{notification_message}</p>
                            <p>{notification_content}</p>
                            @if({action_url})
                                <p><a href="{action_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">{action_text}</a></p>
                            @endif
                            <p>Best regards,<br>The Support Team</p>',
                'description' => 'General purpose template for system notifications',
                'status' => 1,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::firstOrCreate(
                ['name' => $template['name']],
                $template
            );
        }
    }
}
